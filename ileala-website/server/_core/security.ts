import { Express, Request, Response, NextFunction } from 'express';
import { ENV } from './env';

/**
 * Security headers middleware
 * Configures security headers for all responses
 */
export function setupSecurityHeaders(app: Express) {
  // Security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=()'
    );
    
    // Strict Transport Security (HSTS) - only in production with HTTPS
    if (ENV.isProduction) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://api-ileala.up.railway.app https://*.ileala.ae https://*.up.railway.app",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.ileala.ae",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', cspDirectives);
    
    next();
  });
}

/**
 * CORS configuration
 */
export function setupCORS(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://www.ileala.ae',
      'https://ileala.ae',
      'https://admin.ileala.ae',
      'https://api.ileala.ae',
      'https://ileala-admin.up.railway.app',
      'https://api-ileala.up.railway.app',
      ...(ENV.isProduction ? [] : ['http://localhost:5173', 'http://localhost:3000']),
    ];

    // Log CORS for debugging (only for /api routes)
    if (req.path.startsWith('/api')) {
      console.log(`[CORS] Origin: ${origin || 'none'}, Path: ${req.path}, Method: ${req.method}`);
    }

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin && origin.includes('ileala')) {
      // Fallback: allow any ileala domain for flexibility during setup
      console.log(`[CORS] Allowing ileala origin not in list: ${origin}`);
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });
}

/**
 * Request ID middleware for tracing
 */
export function setupRequestId(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || 
                     `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', requestId);
    (req as any).requestId = requestId;
    next();
  });
}



