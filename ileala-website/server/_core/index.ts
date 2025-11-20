import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { trpcRateLimiterMiddleware } from "../middleware/trpcRateLimiter";
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
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Apply rate limiting to tRPC endpoints
  app.use("/api/trpc", trpcRateLimiterMiddleware);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
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

  // Railway uses PORT environment variable, fallback to 3000 for local dev
  const preferredPort = parseInt(process.env.PORT || "3000");
  
  // In production (Railway), use the PORT directly
  // In development, find available port
  const port = process.env.NODE_ENV === "production" 
    ? preferredPort 
    : await findAvailablePort(preferredPort);

  if (port !== preferredPort && process.env.NODE_ENV !== "production") {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}/`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    if (process.env.DATABASE_URL) {
      console.log(`✅ Database: Connected`);
    } else {
      console.warn(`⚠️  Database: DATABASE_URL not configured`);
    }
  });
}

startServer().catch(console.error);
