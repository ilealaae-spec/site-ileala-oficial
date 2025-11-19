import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

// Helper to safely get header value from either Express Request or Fetch Request
function getHeaderValue(req: any, headerName: string): string | string[] | undefined {
  // Check if it's a Fetch API Request (has headers.get method)
  if (req && typeof req.headers?.get === 'function') {
    const value = req.headers.get(headerName);
    return value || undefined;
  }
  
  // Check if it's an Express Request (has headers as object)
  if (req && req.headers && typeof req.headers === 'object') {
    return req.headers[headerName];
  }
  
  return undefined;
}

function isSecureRequest(req: any): boolean {
  // Check protocol property (Express Request)
  if (req?.protocol === "https") return true;

  // Check URL protocol (Fetch Request)
  if (req?.url) {
    try {
      const url = new URL(req.url);
      if (url.protocol === "https:") return true;
    } catch (e) {
      // Invalid URL, continue
    }
  }

  // Check x-forwarded-proto header
  const forwardedProto = getHeaderValue(req, "x-forwarded-proto");
  if (!forwardedProto) {
    // Default to secure in production (Vercel always uses HTTPS)
    return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  }

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : String(forwardedProto).split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: any
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
