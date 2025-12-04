import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, distPath should point to dist/public from project root
  const projectRoot = path.resolve(import.meta.dirname, "..", "..");
  const distPath = path.resolve(projectRoot, "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`Project root: ${projectRoot}`);
    // Exit process if build directory is critical and not found in production
    if (process.env.NODE_ENV === 'production') {
      console.error("Exiting due to missing build directory in production.");
      process.exit(1);
    }
  } else {
    console.log(`✅ Serving static files from: ${distPath}`);
  }

  // Serve static files with proper MIME types
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Set correct MIME types for JavaScript modules
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.ts')) {
        res.setHeader('Content-Type', 'application/typescript');
      } else if (filePath.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'application/typescript');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  // This middleware only runs if no previous middleware has sent a response
  app.use((req, res, next) => {
    // Skip if response was already sent (e.g., by tRPC)
    if (res.headersSent) {
      return next();
    }
    
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve index.html for SPA routing
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`[serveStatic] index.html not found at: ${indexPath}`);
      res.status(404).send('Not found');
    }
  });
}
