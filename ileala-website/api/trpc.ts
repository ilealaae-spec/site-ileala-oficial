// /api/trpc.ts - Using Fetch Adapter for Vercel
import { createFetchHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { trpcRateLimiterMiddleware } from "../server/middleware/trpcRateLimiter";

// Function to get the base URL on Vercel
const getBaseUrl = () => {
    // IMPORTANT: Use the Vercel environment variable
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000"; 
};

// Request handler
const handler = (req: Request) =>
  createFetchHandler({
    router: appRouter,
    // We pass the Request object (req) to createContext
    createContext: ({ req }) => createContext({ req }),
    endpoint: `${getBaseUrl()}/api/trpc`,
    // The tRPC Fetch Handler does not accept global middlewares directly like Express.
    // The Rate Limiter will be moved to createContext and the tRPC Router.
  })(req);

export default handler;
