// api/trpc.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC middleware
app.use(
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC Error] on ${path}:`, error);
    },
  })
);

// Export as Vercel Serverless Function with JSON guarantee
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set JSON content type BEFORE processing
    res.setHeader("Content-Type", "application/json");
    
    return new Promise<void>((resolve, reject) => {
      app(req as any, res as any, (err?: any) => {
        if (err) {
          console.error("[Vercel tRPC Handler] Error:", err);
          
          // Ensure JSON error response
          if (!res.headersSent) {
            res.status(500).json({
              error: {
                message: err.message || "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
              },
            });
          }
          
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error: any) {
    console.error("[Vercel tRPC Handler] Uncaught error:", error);
    
    // Final safety net - always return JSON
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message: error?.message || "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
      });
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
