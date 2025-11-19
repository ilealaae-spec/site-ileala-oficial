// server/middleware/trpcRateLimiter.ts (Model from Previous Answer)
// ... (createTrpcRateLimiter middleware code) ...

// Add this export at the end of the file:
export const registerProcedure = t.procedure.use(createTrpcRateLimiter(registerLimiter));
