// server/middleware/trpcRateLimiter.ts (Native tRPC Version)

import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../_core/trpc';
// Import your original rate limiting functions (which received Express req, res, next):
import {
    registerLimiter,
    verifyEmailLimiter,
    resendEmailLimiter,
    loginLimiter,
    passwordResetLimiter,
} from './rateLimiter'; 

// Helper to execute the rate limiter asynchronously (simulates req, res, next)
function runRateLimiter(limiter: (req: any, res: any, next: any) => void, clientIp: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Creates mock req and res objects with the IP extracted from the context
        const reqMock = { 
            ip: clientIp,
            method: 'POST', // or another relevant method
            url: '/api/trpc'
        };
        const resMock = {};
        
        limiter(reqMock, resMock, (err?: any) => {
            if (err) {
                // The rate limiter called next(error)
                reject(err);
            } else {
                // The rate limiter called next()
                resolve();
            }
        });
    });
}

// ------------------------------------------------
// Base tRPC Middleware
// ------------------------------------------------

// Function to create a tRPC middleware that wraps an Express limiter
const createTrpcRateLimiter = (limiter: (req: any, res: any, next: any) => void) => {
    return t.middleware(async ({ ctx, next, path }) => {
        const clientIp = ctx.clientIp; 

        if (!clientIp) {
            console.warn(`[RateLimit] Failed to determine client IP for path: ${path}`);
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Could not determine client IP address.' });
        }

        try {
            console.log(`[RateLimit] Applying limiter for IP: ${clientIp} on path: ${path}`);
            // Execute the rate limiter, injecting the IP
            await runRateLimiter(limiter, clientIp);
        } catch (error: any) {
            // Assumes the rate limiter returns an error with status 429
            if (error && error.statusCode === 429) { 
                throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded.' });
            }
            throw error; // Propagate other errors
        }

        return next();
    });
};

// ------------------------------------------------
// EXPORTED PROCEDURES (FOR USE IN THE ROUTER)
// ------------------------------------------------

// Registration Procedure (MUST be used instead of publicProcedure for auth.register)
export const registerProcedure = t.procedure.use(createTrpcRateLimiter(registerLimiter));

// Other procedures that need rate limiting (example)
export const loginProcedure = t.procedure.use(createTrpcRateLimiter(loginLimiter));

// Create similar functions for the other limiters (verifyEmail, resend, etc.) and use them in your routers.
