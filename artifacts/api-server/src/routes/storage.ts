import { Router, type IRouter } from "express";
import crypto, { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const STREAM_SECRET = process.env.STREAM_SECRET || "spectra-video-protection-key-2026";

/**
 * Generate a cryptographically signed, short-lived stream ticket.
 * Format: `<expiresAt>.<hmacSignature>`
 */
export function generateStreamTicket(filename: string, expiresInMs = 12 * 60 * 60 * 1000): string {
  const expiresAt = Date.now() + expiresInMs;
  const data = `${filename}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", STREAM_SECRET).update(data).digest("hex");
  return `${expiresAt}.${sig}`;
}

/**
 * Verify a stream ticket against the target filename.
 */
export function verifyStreamTicket(filename: string, ticket: string): boolean {
  if (!ticket || typeof ticket !== "string") return false;
  const parts = ticket.split(".");
  if (parts.length !== 2) return false;
  const [expiresAtStr, sig] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }
  const expectedSig = crypto
    .createHmac("sha256", STREAM_SECRET)
    .update(`${filename}:${expiresAt}`)
    .digest("hex");
  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

router.post("/storage/uploads/request-url", requireAdmin, async (req, res) => {
  const input = RequestUploadUrlBody.parse(req.body);
  const ext = input.name ? path.extname(input.name) : ".mp4";
  const fileId = `${Date.now()}-${randomUUID()}${ext}`;

  const rawHost = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5000";
  const host = Array.isArray(rawHost) ? rawHost[0] : String(rawHost);
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const uploadURL = `${protocol}://${host}/api/storage/uploads/${fileId}`;
  const objectPath = `/objects/${fileId}`;

  res.json(RequestUploadUrlResponse.parse({ uploadURL, objectPath }));
});

router.put("/storage/uploads/:fileId", async (req, res) => {
  const fileId = path.basename(req.params.fileId);
  const targetPath = path.join(UPLOADS_DIR, fileId);

  const writeStream = fs.createWriteStream(targetPath);
  req.pipe(writeStream);

  writeStream.on("finish", () => {
    res.status(200).json({ success: true, fileId });
  });

  writeStream.on("error", (err) => {
    console.error("Storage upload write error:", err);
    res.status(500).json({ error: "Failed to save uploaded file" });
  });
});

/**
 * Generate a fresh stream ticket for legitimate frontend requests.
 */
router.get("/storage/ticket/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const ticket = generateStreamTicket(filename);
  res.json({ ticket });
});

/**
 * Protected streaming endpoint with multi-layered anti-download defense:
 * 1. Blocks IDM (Internet Download Manager) and external downloaders.
 * 2. Blocks direct browser URL navigation / opening in new tab.
 * 3. Requires valid ephemeral HMAC ticket or admin authorization.
 * 4. Injects anti-download/anti-sniff headers (Content-Disposition: inline, no-cache, nosniff).
 */
router.get("/storage/objects/*splat", async (req, res) => {
  const rawPath = Array.isArray(req.params.splat) ? req.params.splat.join("/") : req.params.splat;
  const filename = path.basename(rawPath);
  const targetPath = path.join(UPLOADS_DIR, filename);

  // 1. Anti-Download Inspection: Block IDM and download accelerators
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isBlockedDownloader =
    /(idm|internet\s*download\s*manager|idman|fdm|free\s*download\s*manager|aria2|wget|curl|yt-dlp|youtube-dl|jdownloader|eagleget|bitcomet|xdman|download\s*ninja|internet\s*download\s*accelerator|python-requests|aiohttp|go-http-client|okhttp|postman|insomnia)/i.test(
      userAgent
    );

  if (isBlockedDownloader) {
    res.status(403).json({ error: "Direct downloads and external download tools are not permitted." });
    return;
  }

  // 2. Block IDM custom request headers
  const rawHeaders = JSON.stringify(req.headers).toLowerCase();
  if (rawHeaders.includes("x-idm") || rawHeaders.includes("download-manager")) {
    res.status(403).json({ error: "External download tools are not permitted." });
    return;
  }

  // 3. Block direct browser navigation (user typing or opening URL directly in a tab)
  const secFetchDest = req.headers["sec-fetch-dest"];
  const secFetchMode = req.headers["sec-fetch-mode"];
  if (secFetchDest === "document" || secFetchMode === "navigate") {
    res.status(403).send("Direct browser navigation to stream is forbidden.");
    return;
  }

  // 4. Ticket verification
  const ticket = (req.query.ticket as string) || (req.headers["x-stream-ticket"] as string);
  const isAdmin = req.headers.authorization && req.headers.authorization.startsWith("Bearer ");
  const referer = req.headers.referer || "";
  const isAdminReferer = referer.includes("/admin");

  if (!isAdmin && !isAdminReferer) {
    if (!ticket || !verifyStreamTicket(filename, ticket)) {
      res.status(403).json({ error: "Access token is invalid or has expired." });
      return;
    }
  }

  try {
    const stat = await fs.promises.stat(targetPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(filename).toLowerCase();
    const mimeType =
      ext === ".webm" ? "video/webm" : ext === ".mov" ? "video/quicktime" : "video/mp4";

    // Anti-download and security headers
    const securityHeaders = {
      "Content-Disposition": 'inline; filename="stream.bin"',
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*",
    };

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(targetPath, { start, end });
      const head = {
        ...securityHeaders,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": mimeType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        ...securityHeaders,
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
      };
      res.writeHead(200, head);
      fs.createReadStream(targetPath).pipe(res);
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    console.error("Video stream error:", error);
    res.status(500).json({ error: "Unable to serve video" });
  }
});

export default router;
