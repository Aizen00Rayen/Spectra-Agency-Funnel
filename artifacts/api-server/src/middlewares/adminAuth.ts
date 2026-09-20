import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { and, eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";

export type AdminRequest = Request & {
  adminUserId?: string;
};

export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = getAuth(req);
    const userId = auth.userId;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.clerkUserId, userId))
      .limit(1);

    if (existing.length === 0) {
      const anyAdmin = await db.select({ clerkUserId: adminUsersTable.clerkUserId }).from(adminUsersTable).limit(1);
      if (anyAdmin.length > 0) {
        res.status(403).json({ error: "Admin access has not been granted to this account" });
        return;
      }

      const claims = auth.sessionClaims as Record<string, unknown> | undefined;
      const email =
        typeof claims?.email === "string"
          ? claims.email
          : typeof claims?.primaryEmailAddress === "string"
            ? claims.primaryEmailAddress
            : null;

      await db.insert(adminUsersTable).values({
        clerkUserId: userId,
        email,
        role: "owner",
      });
    }

    req.adminUserId = userId;
    next();
  } catch (error) {
    req.log?.error({ err: error }, "Admin authorization failed");
    res.status(500).json({ error: "Unable to verify admin access" });
  }
}
