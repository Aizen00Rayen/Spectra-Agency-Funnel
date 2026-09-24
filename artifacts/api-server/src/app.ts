import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

import cookieParser from "cookie-parser";
import {
  apiRateLimiter,
  permissionsPolicyMiddleware,
  sanitizeMiddleware,
  securityHeadersMiddleware,
} from "./middlewares/security";

const app: Express = express();

// Disable technology disclosure header
app.disable("x-powered-by");

// Apply production-grade security headers & hardware isolation policies
app.use(securityHeadersMiddleware);
app.use(permissionsPolicyMiddleware);

app.use(cookieParser());
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors({ credentials: true, origin: true }));
if (process.env.CLERK_SECRET_KEY) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
} else {
  logger.warn("CLERK_SECRET_KEY is not set. Clerk auth middleware skipped for local development.");
}

// Request size limit & JSON body parser to prevent payload flooding DoS
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// XSS & Injection payload sanitization for all routes
app.use(sanitizeMiddleware);

// Global API rate limiting
app.use("/api", apiRateLimiter);

app.use("/api", router);

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistCandidates = [
  path.resolve(process.cwd(), "../spectra-agency/dist/public"),
  path.resolve(process.cwd(), "artifacts/spectra-agency/dist/public"),
  path.resolve(__dirname, "../../spectra-agency/dist/public"),
];

const clientDist = clientDistCandidates.find((dir) => fs.existsSync(dir));
if (clientDist) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
