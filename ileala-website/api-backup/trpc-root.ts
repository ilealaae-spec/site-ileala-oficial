// api/trpc.ts - Vercel Serverless Function Handler
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Dynamic imports to ensure server code is bundled
const getServerModules = async () => {
  const { appRouter } = await import("../server/routers");
  const { createContext } = await import("../server/_core/context");
  return { appRouter, createContext };
};

// Convert Fetch Request to Express-like Request for compatibility
const createExpressLikeRequest = (request: Request) => {
  // request should already be a valid Request object at this point
  const url = new URL(request.url);
  
  // Extract all headers for compatibility
  const headers: Record<string, string | string[]> = {};
  
  // Safely extract headers - request should be valid but be defensive
  try {
    if (request.headers && typeof request.headers.forEach === 'function') {
      // Fetch API Headers object
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (request.headers && typeof request.headers === 'object') {
      // Plain object (Express-like)
      Object.assign(headers, request.headers);
    }
  } catch (e) {
    console.error("[Vercel tRPC] Error extracting headers:", e);
    // Continue with empty headers
  }
  
  return {
    method: request.method || 'GET',
    url: request.url || url.toString(), // Keep full URL for protocol detection
    originalUrl: url.pathname + url.search,
    path: url.pathname,
    protocol: url.protocol.replace(':', ''), // 'https:' -> 'https'
    headers,
    query: Object.fromEntries(url.searchParams),
    body: undefined,
    hostname: url.hostname,
  };
};

// Create Express-like Response for compatibility
const createExpressLikeResponse = () => {
  const cookies: Array<{ name: string; value: string; options: Record<string, any> }> = [];
  
  return {
    cookies,
    cookie(name: string, value: string, options: Record<string, any>) {
      cookies.push({ name, value, options });
    },
    clearCookie(name: string, options: Record<string, any>) {
      cookies.push({ name, value: "", options: { ...options, maxAge: -1 } });
    },
    setHeader() {},
    getHeader() { return undefined; },
  };
};

// Main handler function
export default async function handler(request: Request) {
  // Wrap everything in try-catch to catch any errors early
  try {
    return await handleRequest(request);
  } catch (error) {
    console.error("[Vercel tRPC] Fatal error in handler:", error);
    console.error("[Vercel tRPC] Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("[Vercel tRPC] Request info:", {
      hasRequest: !!request,
      requestType: typeof request,
      requestKeys: request ? Object.keys(request) : [],
      hasHeaders: request && !!request.headers,
      headersType: request && request.headers ? typeof request.headers : 'N/A',
    });
    
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
          code: "FATAL_ERROR",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function handleRequest(request: Request) {
  try {
    // FIRST: Create a valid Request object BEFORE accessing any properties
    // This prevents "request.headers.get is not a function" errors
    let validRequest: Request;
    try {
      // Safely extract properties with fallbacks
      const reqAny = request as any;
      const url = reqAny?.url || reqAny?.href || 'http://localhost';
      const method = reqAny?.method || 'GET';
      
      // Extract headers safely - handle all possible formats
      const headers = new Headers();
      if (reqAny?.headers) {
        if (typeof reqAny.headers.forEach === 'function') {
          // Headers object (Fetch API) - has forEach method
          reqAny.headers.forEach((value: string, key: string) => {
            headers.set(key, value);
          });
        } else if (typeof reqAny.headers.get === 'function') {
          // Headers-like object with get method but no forEach
          // Try to get common headers
          try {
            const commonHeaders = ['cookie', 'content-type', 'authorization', 'user-agent', 'accept'];
            commonHeaders.forEach(headerName => {
              const value = reqAny.headers.get(headerName);
              if (value) headers.set(headerName, value);
            });
          } catch (e) {
            // If that fails, try to convert to object
            if (typeof reqAny.headers === 'object') {
              Object.entries(reqAny.headers).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  headers.set(key, value);
                } else if (Array.isArray(value)) {
                  value.forEach((v: any) => headers.append(key, String(v)));
                }
              });
            }
          }
        } else if (typeof reqAny.headers === 'object') {
          // Plain object
          Object.entries(reqAny.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
              headers.set(key, value);
            } else if (Array.isArray(value)) {
              value.forEach((v: any) => headers.append(key, String(v)));
            }
          });
        }
      }
      
      // Create a new Request object with all properties
      validRequest = new Request(url, {
        method,
        headers,
        body: reqAny?.body,
        cache: reqAny?.cache,
        credentials: reqAny?.credentials,
        integrity: reqAny?.integrity,
        keepalive: reqAny?.keepalive,
        mode: reqAny?.mode,
        redirect: reqAny?.redirect,
        referrer: reqAny?.referrer,
        referrerPolicy: reqAny?.referrerPolicy,
        signal: reqAny?.signal,
      });
    } catch (e) {
      console.error("[Vercel tRPC] Failed to create valid Request:", e);
      return new Response(
        JSON.stringify({
          error: {
            message: 'Failed to process request',
            code: 'REQUEST_CONVERSION_ERROR',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log("[Vercel tRPC] Handling request:", validRequest.method, validRequest.url);
    
    // Load server modules dynamically
    const { appRouter, createContext } = await getServerModules();
    
    // Create Express-like objects for compatibility using validRequest
    const expressReq = createExpressLikeRequest(validRequest);
    const expressRes = createExpressLikeResponse();
    
    // Create tRPC context
    const ctx = await createContext({
      req: expressReq as any,
      res: expressRes as any,
    });
    
    console.log("[Vercel tRPC] Context created, user:", ctx.user?.email || "anonymous");
    
    // Handle the request with tRPC using validRequest
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: validRequest,
      router: appRouter,
      createContext: () => ctx,
      onError: ({ error, path, type }) => {
        console.error("[Vercel tRPC] Error in handler:", {
          error: error.message,
          path,
          type,
          stack: error.stack,
        });
      },
    });
    
    // Ensure response is JSON - check status and content type
    const contentType = response.headers.get('content-type') || '';
    const isErrorStatus = response.status >= 400;
    
    if (isErrorStatus && !contentType.includes('application/json')) {
      // If response is an error and not JSON, try to read it and convert to JSON error
      const text = await response.text().catch(() => 'Unknown error');
      console.error("[Vercel tRPC] Non-JSON error response received:", text.substring(0, 200));
      
      return new Response(
        JSON.stringify({
          error: {
            message: text.includes('server error') || text.includes('Server Error')
              ? 'A server error occurred. Please try again later.'
              : 'An unexpected error occurred',
            code: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? text.substring(0, 500) : undefined,
          },
        }),
        {
          status: response.status || 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
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
