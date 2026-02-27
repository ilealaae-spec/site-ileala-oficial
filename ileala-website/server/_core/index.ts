import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerGoogleOAuthRoutes } from "./googleOAuth";
import { registerAppleAuthRoutes } from "../apple-auth";
import { registerStripeWebhookRoutes } from "../stripe-webhook-routes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiLimiter } from "../middleware/rateLimiter";
import { logger } from "./logger";
import { setupSecurityHeaders, setupCORS, setupRequestId } from "./security";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations first
  try {
    logger.info("[Startup] Running database migrations...");
    const { runMigrations } = await import("../migrate");
    await runMigrations();
    logger.info("[Startup] Database migrations completed successfully");
  } catch (error) {
    logger.error("[Startup] Failed to run migrations:", error);
    // Continue anyway - migrations might have already been run
  }

  const app = express();
  const server = createServer(app);
  
  // Trust proxy - required for Railway and other reverse proxies
  app.set('trust proxy', 1);
  
  // Security headers (must be first)
  setupSecurityHeaders(app);
  
  // CORS configuration
  setupCORS(app);

  // Request ID for tracing
  setupRequestId(app);

  // IMPORTANT: Stripe webhook routes MUST come BEFORE body parser
  // Stripe requires raw body for signature verification
  registerStripeWebhookRoutes(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Apply general API rate limiting
  app.use("/api", apiLimiter);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Google OAuth routes (direct Google OAuth)
  registerGoogleOAuthRoutes(app);

  // Apple Sign-In routes
  registerAppleAuthRoutes(app);
  
  // Health check endpoint
  app.get("/health", async (req, res) => {
    try {
      // Check database connection
      const db = await import("../db");
      const dbInstance = await db.getDb();
      
      if (!dbInstance) {
        return res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          checks: {
            database: "disconnected",
          },
        });
      }
      
      // Try a simple query to verify database is responsive
      try {
        await dbInstance.execute(`SELECT 1 as health_check`);
      } catch (error) {
        return res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          checks: {
            database: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
      
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: "connected",
        },
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  });

  // SECURITY: Debug and emergency endpoints removed for production
  // If you need emergency admin access, use the database directly or environment variables

  // Redirect admin.ileala.ae root to /admin
  app.use((req, res, next) => {
    const hostname = req.hostname || req.get('host');
    
    // Check if accessing admin subdomain root
    if (hostname?.includes('admin.ileala.ae') && req.path === '/') {
      logger.info(`[Redirect] ${hostname}${req.path} -> /admin`);
      return res.redirect(301, '/admin');
    }
    
    next();
  });

  // tRPC API - must be before static file serving
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // development mode uses Vite, production mode uses static files
  // CRITICAL: Force production mode in Railway/deployment environments
  // Railway may set NODE_ENV=development, but we need production mode for static files
  
  // Detect if we're in Railway (Railway sets RAILWAY_ENVIRONMENT or RAILWAY_PROJECT_ID)
  const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
  
  // Only use development mode if:
  // 1. NODE_ENV is explicitly "development" AND
  // 2. We're NOT in Railway (local development only)
  const isDevelopment = process.env.NODE_ENV === "development" && !isRailway;
  
  // Force production mode if in Railway or if NODE_ENV is not explicitly "development"
  if (!isDevelopment) {
    process.env.NODE_ENV = "production";
  }
  
  // Log detailed environment info
  logger.info(`[Server] Environment check:`);
  logger.info(`  - process.env.NODE_ENV (original): ${process.env.NODE_ENV || "undefined"}`);
  logger.info(`  - RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || "not set"}`);
  logger.info(`  - RAILWAY_PROJECT_ID: ${process.env.RAILWAY_PROJECT_ID || "not set"}`);
  logger.info(`  - isRailway: ${isRailway}`);
  logger.info(`  - isDevelopment: ${isDevelopment}`);
  logger.info(`  - process.env.NODE_ENV (final): ${process.env.NODE_ENV}`);
  logger.info(`  - process.cwd(): ${process.cwd()}`);
  
  if (isDevelopment) {
    logger.info("[Server] Using Vite dev server (local development)");
    await setupVite(app, server);
  } else {
    logger.info("[Server] Using static files (production mode)");
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    logger.info(`Server running on http://0.0.0.0:${port}/`);
    logger.info(`Health check available at http://0.0.0.0:${port}/health`);
    console.log(`✅ Server listening on port ${port}`);
    console.log(`✅ Health check: http://0.0.0.0:${port}/health`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
