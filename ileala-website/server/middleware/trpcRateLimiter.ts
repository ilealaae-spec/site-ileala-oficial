import { Request, Response, NextFunction } from 'express';
import {
  registerLimiter,
  verifyEmailLimiter,
  resendEmailLimiter,
  loginLimiter,
  passwordResetLimiter,
} from './rateLimiter';

/**
 * Middleware to apply rate limiting to specific tRPC procedures
 * Extracts the procedure name from the URL and applies the appropriate rate limiter
 */
export function trpcRateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Extract procedure path from URL
  // Format: /api/trpc/auth.register or /api/trpc/auth.login,auth.register (batch)
  const path = req.path;
  
  // Get procedure name from path
  const procedureMatch = path.match(/\/api\/trpc\/(.+)/);
  if (!procedureMatch) {
    return next();
  }

  const procedures = procedureMatch[1].split(',');
  
  // Check if any procedure needs rate limiting
  for (const procedure of procedures) {
    const trimmedProcedure = procedure.trim();
    
    // Apply rate limiter based on procedure name
    switch (trimmedProcedure) {
      case 'auth.register':
        console.log(`[RateLimit] Applying register limiter for ${req.ip}`);
        return registerLimiter(req, res, next);
      
      case 'auth.verifyEmail':
        console.log(`[RateLimit] Applying verify email limiter for ${req.ip}`);
        return verifyEmailLimiter(req, res, next);
      
      case 'auth.resendVerification':
        console.log(`[RateLimit] Applying resend email limiter for ${req.ip}`);
        return resendEmailLimiter(req, res, next);
      
      case 'auth.login':
        console.log(`[RateLimit] Applying login limiter for ${req.ip}`);
        return loginLimiter(req, res, next);
      
      case 'auth.requestPasswordReset':
      case 'auth.resetPassword':
        console.log(`[RateLimit] Applying password reset limiter for ${req.ip}`);
        return passwordResetLimiter(req, res, next);
    }
  }
  
  // No rate limiting needed for this procedure
  next();
}

/**
 * Alternative approach: Apply rate limiting based on request body
 * This works for POST requests where the procedure is in the body
 */
export function trpcRateLimiterByBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only process POST requests with JSON body
  if (req.method !== 'POST' || !req.body) {
    return next();
  }

  // tRPC sends procedure name in the body for mutations
  const procedure = req.body?.procedure || req.body?.path;
  
  if (!procedure) {
    return next();
  }

  // Apply rate limiter based on procedure name
  switch (procedure) {
    case 'auth.register':
      return registerLimiter(req, res, next);
    
    case 'auth.verifyEmail':
      return verifyEmailLimiter(req, res, next);
    
    case 'auth.resendVerification':
      return resendEmailLimiter(req, res, next);
    
    case 'auth.login':
      return loginLimiter(req, res, next);
    
    case 'auth.requestPasswordReset':
    case 'auth.resetPassword':
      return passwordResetLimiter(req, res, next);
    
    default:
      next();
  }
}
