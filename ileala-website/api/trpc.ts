import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { trpcRateLimiterMiddleware } from "../server/middleware/trpcRateLimiter";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Create Express app for tRPC
const app = express();

// Configure body parser with larger size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Apply rate limiting to tRPC endpoints
app.use(trpcRateLimiterMiddleware);

// tRPC middleware
app.use(
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export as Vercel Serverless Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error("[Vercel tRPC Handler] Error:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
