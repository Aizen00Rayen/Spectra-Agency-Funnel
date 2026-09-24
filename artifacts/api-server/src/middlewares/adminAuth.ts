import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";

export type AdminRequest = Request & {
  adminUserId?: string;
};

export const ADMIN_DEFAULT_EMAIL = process.env.ADMIN_EMAIL || "admin@spectra.agency";
export const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "spectra2025";
const ADMIN_AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET || process.env.STREAM_SECRET || "spectra-agency-admin-auth-secret-key-2026";

const activeSessions = new Set<string>();

/**
 * Generate a cryptographically signed HMAC admin session token.
 * Format: `spectra.<userId>.<expiresAt>.<signature>`
 */
export function createAdminSession(email: string, expiresInMs = 7 * 24 * 60 * 60 * 1000): string {
  const userId = "admin-spectra-owner";
  const expiresAt = Date.now() + expiresInMs;
  const data = `${userId}:${email.toLowerCase()}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", ADMIN_AUTH_SECRET).update(data).digest("hex");
  const token = `spectra.${Buffer.from(userId).toString("base64url")}.${expiresAt}.${sig}`;
  activeSessions.add(token);
  return token;
}

/**
 * Verifies the integrity, signature, and expiration of an admin session token.
 */
export function verifyAdminSession(token?: string): boolean {
  if (!token || typeof token !== "string") return false;

  // Local dev convenience token (only allowed outside production)
  if (process.env.NODE_ENV !== "production" && token === "spectra_local_dev_token") {
    return true;
  }

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "spectra") {
    return false;
  }

  const [, encodedUserId, expiresAtStr, sig] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    activeSessions.delete(token);
    return false;
  }

  try {
    const userId = Buffer.from(encodedUserId, "base64url").toString("utf-8");
    const data = `${userId}:${ADMIN_DEFAULT_EMAIL.toLowerCase()}:${expiresAt}`;
    const expectedSig = crypto.createHmac("sha256", ADMIN_AUTH_SECRET).update(data).digest("hex");

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");

    if (sigBuf.length !== expectedBuf.length) return false;
    const isValid = crypto.timingSafeEqual(sigBuf, expectedBuf);

    if (isValid) {
      activeSessions.add(token);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function revokeAdminSession(token?: string): void {
  if (token) activeSessions.delete(token);
}

/**
 * Timing-safe credential validation for administrator login.
 */
export function validateAdminCredentials(email: string, password: string): { valid: boolean; email?: string } {
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return { valid: false };
  }

  const expectedEmail = ADMIN_DEFAULT_EMAIL.toLowerCase().trim();
  const inputEmail = email.toLowerCase().trim();
  const expectedPassword = ADMIN_DEFAULT_PASSWORD;

  const emailMatch = inputEmail === expectedEmail;

  // Constant-time comparison to prevent timing attacks
  const passBuf = Buffer.from(password);
  const expectedPassBuf = Buffer.from(expectedPassword);
  const passMatch =
    passBuf.length === expectedPassBuf.length && crypto.timingSafeEqual(passBuf, expectedPassBuf);

  if (emailMatch && passMatch) {
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
