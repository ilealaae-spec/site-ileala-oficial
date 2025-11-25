import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerGoogleOAuthRoutes } from "./googleOAuth";
import { registerStripeWebhookRoutes } from "../stripe-webhook-routes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiLimiter } from "../middleware/rateLimiter";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
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
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Apply general API rate limiting
  app.use("/api", apiLimiter);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Google OAuth routes (direct Google OAuth)
  registerGoogleOAuthRoutes(app);
  
  // Stripe webhook routes
  registerStripeWebhookRoutes(app);
  
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

  // Emergency admin creation route
  app.post("/api/create-emergency-admin", async (req, res) => {
    try {
      const DATABASE_URL = process.env.DATABASE_URL;
      
      if (!DATABASE_URL) {
        return res.status(500).json({ 
          success: false,
          error: 'Database connection not configured' 
        });
      }

      const sql = neon(DATABASE_URL);

      const EMERGENCY_EMAIL = 'ceo@ileala.ae';
      const EMERGENCY_PASSWORD = 'IleAla@2025';
      const EMERGENCY_NAME = 'Emergency Admin';

      const hashedPassword = await bcrypt.hash(EMERGENCY_PASSWORD, 10);

      const existingUser = await sql`
        SELECT id, email, role FROM users WHERE email = ${EMERGENCY_EMAIL} LIMIT 1
      `;

      if (existingUser.length > 0) {
        await sql`
          UPDATE users 
          SET role = 'admin', password = ${hashedPassword}
          WHERE email = ${EMERGENCY_EMAIL}
        `;

        return res.status(200).json({
          success: true,
          message: 'Emergency admin user updated successfully!',
          email: EMERGENCY_EMAIL,
          instructions: [
            'You can now login at: https://www.ileala.ae/admin-emergency-login',
            `Email: ${EMERGENCY_EMAIL}`,
            `Password: ${EMERGENCY_PASSWORD}`,
            'After login, you will be redirected to the admin panel.',
          ],
        });
      }

      await sql`
        INSERT INTO users (email, password, name, role, "createdAt")
        VALUES (
          ${EMERGENCY_EMAIL},
          ${hashedPassword},
          ${EMERGENCY_NAME},
          'admin',
          NOW()
        )
      `;

      return res.status(201).json({
        success: true,
        message: 'Emergency admin user created successfully!',
        email: EMERGENCY_EMAIL,
        instructions: [
          'You can now login at: https://www.ileala.ae/admin-emergency-login',
          `Email: ${EMERGENCY_EMAIL}`,
          `Password: ${EMERGENCY_PASSWORD}`,
          'After login, you will be redirected to the admin panel.',
          'IMPORTANT: Consider deleting this API route after creating the user for security!',
        ],
      });
    } catch (error: any) {
      logger.error('[Emergency Admin] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create emergency admin user',
        details: error.message,
      });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}/`);
    logger.info(`Health check available at http://localhost:${port}/health`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
