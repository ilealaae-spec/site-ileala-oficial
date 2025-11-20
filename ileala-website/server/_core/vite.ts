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
  // In production, build output is in dist/public relative to project root
  // import.meta.dirname points to server/_core, so we go up 2 levels to project root
  const projectRoot = path.resolve(import.meta.dirname, "..", "..");
  const distPath = path.resolve(projectRoot, "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`Project root: ${projectRoot}`);
  } else {
    console.log(`✅ Serving static files from: ${distPath}`);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // This middleware only runs if no previous middleware has sent a response
  app.use((req, res, next) => {
    // Skip if response was already sent (e.g., by tRPC)
    if (res.headersSent) {
      return next();
    }
    // Serve index.html for SPA routing
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
