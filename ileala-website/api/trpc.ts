// api/trpc.ts - Vercel Serverless Function Handler
// This file adapts the Express-based tRPC server to work with Vercel's Fetch API

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Dynamic imports to ensure server code is bundled
const getServerModules = async () => {
  const { appRouter } = await import("../server/routers");
  const { createContext } = await import("../server/_core/context");
  return { appRouter, createContext };
};

// Convert Fetch Request to Express-like Request for compatibility
const createExpressLikeRequest = (request: Request) => {
  const url = new URL(request.url);
  
  return {
    method: request.method,
    url: url.pathname + url.search,
    headers: {
      cookie: request.headers.get("cookie") || undefined,
      "content-type": request.headers.get("content-type") || undefined,
      authorization: request.headers.get("authorization") || undefined,
    },
    query: Object.fromEntries(url.searchParams),
    body: undefined, // Will be parsed by tRPC
  };
};

// Create Express-like Response for compatibility
const createExpressLikeResponse = () => {
  const cookies: Array<{ name: string; value: string; options: any }> = [];
  
  return {
    cookies,
    cookie(name: string, value: string, options: any) {
      cookies.push({ name, value, options });
    },
    clearCookie(name: string, options: any) {
      cookies.push({ name, value: "", options: { ...options, maxAge: -1 } });
    },
    setHeader() {},
    getHeader() {},
  };
};

// Main handler function
export default async function handler(request: Request) {
  try {
    console.log("[Vercel tRPC] Handling request:", request.method, request.url);
    
    // Load server modules dynamically
    const { appRouter, createContext } = await getServerModules();
    
    // Create Express-like objects for compatibility
    const expressReq = createExpressLikeRequest(request);
    const expressRes = createExpressLikeResponse();
    
    // Create tRPC context
    const ctx = await createContext({
      req: expressReq as any,
      res: expressRes as any,
    });
    
    console.log("[Vercel tRPC] Context created, user:", ctx.user?.email || "anonymous");
    
    // Handle the request with tRPC
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: () => ctx,
    });
    
    // Add cookies to response if any were set
    if (expressRes.cookies.length > 0) {
      const newHeaders = new Headers(response.headers);
      
      for (const { name, value, options } of expressRes.cookies) {
        const cookieParts = [`${name}=${value}`];
        
        if (options.maxAge) {
          cookieParts.push(`Max-Age=${options.maxAge}`);
        }
        if (options.path) {
          cookieParts.push(`Path=${options.path}`);
        }
        if (options.domain) {
          cookieParts.push(`Domain=${options.domain}`);
        }
        if (options.secure) {
          cookieParts.push("Secure");
        }
        if (options.httpOnly ) {
          cookieParts.push("HttpOnly");
        }
        if (options.sameSite) {
          cookieParts.push(`SameSite=${options.sameSite}`);
        }
        
        newHeaders.append("Set-Cookie", cookieParts.join("; "));
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
    
    console.log("[Vercel tRPC] Request handled successfully");
    return response;
    
  } catch (error) {
    console.error("[Vercel tRPC] Error handling request:", error);
    console.error("[Vercel tRPC] Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Vercel serverless function configuration
export const config = {
  runtime: "nodejs18.x",
  maxDuration: 10,
};
