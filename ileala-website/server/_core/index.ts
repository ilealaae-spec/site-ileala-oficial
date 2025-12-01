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

  // Cookie debug endpoint
  app.get("/api/debug-cookies", (req, res) => {
    const { getSessionCookieOptions } = require("./cookies");
    const cookieOptions = getSessionCookieOptions(req);
    
    res.json({
      request: {
        protocol: req.protocol,
        hostname: req.hostname,
        secure: req.secure,
        headers: {
          'x-forwarded-proto': req.headers['x-forwarded-proto'],
          'x-forwarded-host': req.headers['x-forwarded-host'],
          'host': req.headers['host'],
        },
      },
      cookieOptions,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
      },
      currentCookies: req.cookies,
    });
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
  // Simple debug endpoint for 2FA status (REST, not tRPC)
  app.get("/api/debug-2fa/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const db = await import("../db");
      const dbInstance = await db.getDb();
      
      if (!dbInstance) {
        return res.status(503).json({
          error: "Database not connected"
        });
      }
      
      // Query user with 2FA fields
      const result = await dbInstance.execute(
        `SELECT id, email, "twoFactorEnabled", "twoFactorSecret", role FROM users WHERE email = ? LIMIT 1`,
        [email]
      );
      
      const user = result.rows[0];
      
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          email: email
        });
      }
      
      // Return detailed debug info
      return res.status(200).json({
        success: true,
        email: user.email,
        twoFactorEnabled: {
          value: user.twoFactorEnabled,
          type: typeof user.twoFactorEnabled,
          isTrue: user.twoFactorEnabled === true,
          isOne: user.twoFactorEnabled === 1,
          isTruthy: !!user.twoFactorEnabled,
          rawValue: JSON.stringify(user.twoFactorEnabled)
        },
        twoFactorSecret: {
          exists: !!user.twoFactorSecret,
          length: user.twoFactorSecret ? user.twoFactorSecret.length : 0,
          preview: user.twoFactorSecret ? user.twoFactorSecret.substring(0, 4) + "..." : null
        },
        role: user.role,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error("[Debug 2FA] Error:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

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
