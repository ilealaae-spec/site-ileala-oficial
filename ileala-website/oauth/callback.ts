import "dotenv/config";
import express from "express";
import { registerOAuthRoutes } from "../../server/_core/oauth";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Create Express app for OAuth
const app = express();

// Configure body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register OAuth routes
registerOAuthRoutes(app);

// Export as Vercel Serverless Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error("[Vercel OAuth Handler] Error:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
