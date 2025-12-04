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

  // Serve index.html for SPA routing - must be last middleware
  // This catches all non-API routes and serves the built index.html
  app.get('*', (req, res, next) => {
    // Skip API routes - they should be handled by tRPC middleware above
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Skip static asset requests (they should be served by express.static above)
    // Check if request is for a file (has extension) and file exists
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|webp)$/)) {
      // Let express.static handle it, or 404 if not found
      return next();
    }
    
    // Skip if response was already sent
    if (res.headersSent) {
      return next();
    }
    
    // Serve the built index.html (Vite transforms it during build)
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      console.log(`[serveStatic] Serving index.html for: ${req.path}`);
      res.sendFile(indexPath);
    } else {
      console.error(`[serveStatic] index.html not found at: ${indexPath}`);
      console.error(`[serveStatic] distPath: ${distPath}`);
      console.error(`[serveStatic] Files in distPath:`, fs.existsSync(distPath) ? fs.readdirSync(distPath) : 'distPath does not exist');
      res.status(404).send('Build files not found. Please rebuild the application.');
    }
  });
}
