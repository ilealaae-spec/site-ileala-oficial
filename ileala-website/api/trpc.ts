// api/trpc.ts
import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: false, // importante para tRPC
  },
};

export default createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }) => createContext({ req: req as any, res: res as any }),
  onError({ error, path }) {
    console.error(`tRPC Error on ${path}:`, error);
  },
});

// Opcional: para debug rápido
// export const GET = () => new Response("tRPC endpoint working");
// export const OPTIONS = () => new Response(null, { status: 204 });
