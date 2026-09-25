import type { Request, Response, NextFunction, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

/**
 * Strips dangerous HTML tags, executable script vectors, event handlers,
 * and malicious URI schemes (javascript:, data:text/html) from input strings.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== "string") return val;

  let sanitized = val
    // Remove null bytes and invisible control characters
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Remove <script> tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove <iframe>, <object>, <embed>, <applet>, <meta>, <link> tags
    .replace(/<\/?(?:iframe|object|embed|applet|meta|link|style|base|form)[^>]*>/gi, "")
    // Remove inline event handlers (e.g. onclick=, onerror=, onload=)
    .replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Remove javascript: or vbscript: pseudoprotocols
    .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, "blocked:");

  return sanitized.trim();
}

/**
 * Recursively sanitizes all string properties in an object or array.
 */
export function sanitizePayload<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === "string") {
    return sanitizeString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof input === "object" && input.constructor === Object) {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      output[key] = sanitizePayload(value);
    }
    return output as T;
  }

  return input;
}

/**
 * Express middleware that sanitizes request body, query parameters, and params
 * against XSS and code injection attempts.
 */
export const sanitizeMiddleware: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      req.body[key] = sanitizePayload(req.body[key]);
    }
  }
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      (req.query as Record<string, unknown>)[key] = sanitizePayload((req.query as Record<string, unknown>)[key]);
    }
  }
  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      req.params[key] = sanitizePayload(req.params[key]);
    }
  }
  next();
};

/**
 * Global API rate limiter: 150 requests per minute per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again in a moment." },
});

/**
 * Strict Form & Lead Submission rate limiter:
 * Limits visitors to 10 submissions per 10 minutes to prevent spam/flooding.
 */
export const leadSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many consultation requests submitted. Please wait a few minutes before trying again." },
});

/**
 * Admin Login Brute Force Protection:
 * Limits login attempts to 8 per 15 minutes per IP.
 */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many failed login attempts. Account temporarily locked for 15 minutes." },
});

/**
 * Production-grade HTTP security headers configured via Helmet.
 */
export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // required for Vite runtime & React inline handlers
        "'unsafe-eval'",
        "https://*.clerk.com",
        "https://*.clerk.dev",
        "https://challenges.cloudflare.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://api.microlink.io",
        "https://*.microlink.io",
        "https://images.unsplash.com",
        "https://s0.wp.com",
        "https://*.clerk.com",
        "https://img.clerk.com",
        "https://*.google.com",
        "https://*.googleusercontent.com",
        "https://*.ytimg.com",
      ],
      mediaSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://*.googlevideo.com",
        "https://*.google.com",
        "https://*.googleusercontent.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.clerk.com",
        "https://*.clerk.dev",
        "https://api.microlink.io",
        "https://*.microlink.io",
        "https://*.google.com",
        "https://*.googleusercontent.com",
        "https://*.googlevideo.com",
      ],
      frameSrc: [
        "'self'",
        "https://challenges.cloudflare.com",
        "https://drive.google.com",
        "https://*.google.com",
        "https://*.googleusercontent.com",
        "https://*.youtube.com",
        "https://*.youtube-nocookie.com",
        "https://player.vimeo.com",
      ],
      childSrc: [
        "'self'",
        "blob:",
        "https://drive.google.com",
        "https://*.google.com",
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // allows media streaming & third party snapshot embeds
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" }, // clickjacking defense
  hidePoweredBy: true, // removes X-Powered-By: Express
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true, // prevents MIME-sniffing
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

/**
 * Custom permissions policy middleware for privacy & hardware isolation.
 */
export const permissionsPolicyMiddleware: RequestHandler = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), vr=(), interest-cohort=()"
  );
  next();
};
