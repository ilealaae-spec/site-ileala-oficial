// api/trpc.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// monta o tRPC na raiz da função
app.use(
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path, type, input }) {
      console.error("[tRPC Error]", {
        path,
        type,
        input,
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
    },
  }),
);

// Vercel handler simples
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
