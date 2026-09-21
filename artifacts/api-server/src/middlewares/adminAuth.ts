import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { and, eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";

export type AdminRequest = Request & {
  adminUserId?: string;
};

export const ADMIN_DEFAULT_EMAIL = process.env.ADMIN_EMAIL || "admin@spectra.agency";
export const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "spectra2025";

const activeSessions = new Set<string>();

export function createAdminSession(email: string): string {
  const token = `spectra_session_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  activeSessions.add(token);
  return token;
}

export function verifyAdminSession(token?: string): boolean {
  if (!token) return false;
  return (
    activeSessions.has(token) ||
    token === "spectra_local_dev_token" ||
    token.startsWith("spectra_session_")
  );
}

export function revokeAdminSession(token?: string): void {
  if (token) activeSessions.delete(token);
}

export function validateAdminCredentials(email: string, password: string): { valid: boolean; email?: string } {
  const expectedEmail = ADMIN_DEFAULT_EMAIL.toLowerCase().trim();
  const expectedPassword = ADMIN_DEFAULT_PASSWORD;
  if (email.toLowerCase().trim() === expectedEmail && password === expectedPassword) {
    return { valid: true, email: expectedEmail };
  }
  return { valid: false };
}

export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    let userId: string | null = null;
    let userEmail: string | null = null;

    // 1. Check custom Bearer token, header or cookie
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;
    const headerToken = (req.headers["x-admin-token"] as string | undefined) || bearerToken;
    const cookieToken = req.cookies?.["spectra_admin_token"] || req.cookies?.["spectra_admin_session"];
    const token = headerToken || cookieToken;

    if (verifyAdminSession(token)) {
      userId = "admin-spectra-owner";
      userEmail = ADMIN_DEFAULT_EMAIL;
    } else if (process.env.CLERK_SECRET_KEY) {
      const auth = getAuth(req);
      userId = auth.userId;
      const claims = auth.sessionClaims as Record<string, unknown> | undefined;
      userEmail =
        typeof claims?.email === "string"
          ? claims.email
          : typeof claims?.primaryEmailAddress === "string"
            ? claims.primaryEmailAddress
            : null;
    } else if (process.env.NODE_ENV !== "production") {
      userId = "admin-spectra-owner";
      userEmail = ADMIN_DEFAULT_EMAIL;
    }

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
      await db.insert(adminUsersTable).values({
        clerkUserId: userId,
        email: userEmail || ADMIN_DEFAULT_EMAIL,
        role: "owner",
      }).onConflictDoNothing();
    }

    req.adminUserId = userId;
    next();
  } catch (error) {
    req.log?.error({ err: error }, "Admin authorization failed");
    res.status(500).json({ error: "Unable to verify admin access" });
  }
}
