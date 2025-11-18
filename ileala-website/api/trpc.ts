// api/trpc.ts
import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createExpressMiddleware({
  router: appRouter,
  createContext,
  onError({ error, path }) {
    // opcional: deixa comentado em produção
    // console.error(`tRPC Error on ${path}:`, error);
  },
});
