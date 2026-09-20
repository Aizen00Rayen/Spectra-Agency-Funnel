import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { db, videoAssetsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

router.post("/storage/uploads/request-url", requireAdmin, async (req, res) => {
  const input = RequestUploadUrlBody.parse(req.body);
  const uploadURL = await objectStorage.getObjectEntityUploadURL();
  const objectPath = objectStorage.normalizeObjectEntityPath(uploadURL);
  res.json(RequestUploadUrlResponse.parse({ uploadURL, objectPath }));
});

router.get("/storage/objects/*splat", async (req, res) => {
  const rawPath = Array.isArray(req.params.splat) ? req.params.splat.join("/") : req.params.splat;
  const objectPath = `/objects/${rawPath}`;
  const published = await db
    .select({ id: videoAssetsTable.id })
    .from(videoAssetsTable)
    .where(and(eq(videoAssetsTable.objectPath, objectPath), eq(videoAssetsTable.isPublished, true)))
    .limit(1);

  if (published.length === 0) {
    res.status(404).json({ error: "Object is not public" });
    return;
  }

  try {
    const file = await objectStorage.getObjectEntityFile(objectPath);
    const response = await objectStorage.downloadObject(file, 300);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.status(200);
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        await pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log?.error({ err: error }, "Object download failed");
    res.status(500).json({ error: "Unable to serve video" });
  }
});

export default router;
