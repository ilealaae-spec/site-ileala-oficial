import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerGoogleOAuthRoutes } from "./googleOAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiLimiter } from "../middleware/rateLimiter";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

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
  console.log("🚀 Starting server...");
  
  const app = express();
  const server = createServer(app);
  
  // Configure CORS to allow requests from the frontend domain
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://www.ileala.ae',
      'https://ileala.ae',
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Health check endpoint for Railway - MUST be first to respond quickly
  app.get("/health", (_req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Start listening on port IMMEDIATELY - before any heavy initialization
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = process.env.NODE_ENV === "production" 
    ? preferredPort 
    : await findAvailablePort(preferredPort);

  console.log(`📡 Starting server on port ${port}...`);
  
  // Start server FIRST, then configure routes
  await new Promise<void>((resolve, reject) => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server listening on http://0.0.0.0:${port}/`);
      console.log(`✅ Health check available at http://0.0.0.0:${port}/health`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      if (process.env.DATABASE_URL) {
        console.log(`✅ Database: DATABASE_URL configured`);
      } else {
        console.warn(`⚠️  Database: DATABASE_URL not configured`);
      }
      resolve();
    });
    
    server.on("error", (error: any) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
      }
      reject(error);
    });
  });

  // NOW configure routes and middleware (after server is listening)
  console.log("🔧 Configuring routes and middleware...");
  
  // Apply general API rate limiting (tRPC rate limiting is handled in individual procedures)
  app.use("/api", apiLimiter);
  
  // OAuth callback under /api/oauth/callback (Manus OAuth - if configured)
  registerOAuthRoutes(app);
  
  // Google OAuth routes (direct Google OAuth)
  registerGoogleOAuthRoutes(app);
  
  // Emergency admin creation route (for Railway migration)
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
      const EMERGENCY_PASSWORD = 'IleAla2025!Admin#Emergency';
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
            'You can now login at: https://ileala.ae/admin-emergency-login',
            `Email: ${EMERGENCY_EMAIL}`,
            'Password: IleAla2025!Admin#Emergency',
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
          'You can now login at: https://ileala.ae/admin-emergency-login',
          `Email: ${EMERGENCY_EMAIL}`,
          'Password: IleAla2025!Admin#Emergency',
          'After login, you will be redirected to the admin panel.',
          'IMPORTANT: Consider deleting this API route after creating the user for security!',
        ],
      });
    } catch (error: any) {
      console.error('Error creating emergency admin:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create emergency admin user',
        details: error.message,
      });
    }
  });
  
  // tRPC API
  console.log("🔧 Setting up tRPC...");
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  console.log("🔧 Setting up static file serving...");
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  console.log("✅ Server fully configured and ready!");

  // Handle uncaught errors
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});