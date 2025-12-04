// Force deployment: 2025-12-04 18:00:00
// Build timestamp: 2025-12-04-18:00:00 - Force rebuild: garantir todas as páginas incluídas no bundle
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [react(), tailwindcss(), vitePluginManusRuntime()];

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Force new hash for every build to prevent cache issues
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        // Ensure consistent hashing
        manualChunks: undefined,
      },
      onwarn(warning, warn) {
        // Ignorar avisos de módulos externos e imports dinâmicos durante o build
        if (warning.code === 'EXTERNAL_MODULE' || 
            warning.code === 'UNRESOLVED_IMPORT' ||
            (warning.message && warning.message.includes('@sentry/react')) ||
            (warning.message && warning.message.includes('embroidered-world-map.webp'))) {
          return;
        }
        warn(warning);
      },
    },
    // Force rebuild by changing build ID
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  define: {
    // Manually inject VITE_* variables from .env file
    'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'ILE ALA - Luxury Home & Table Linens'),
    'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || 'https://admin.ileala.ae'),
    'import.meta.env.VITE_APP_ID': JSON.stringify(env.VITE_APP_ID || 'ileala-admin'),
    'import.meta.env.VITE_SITE_URL': JSON.stringify(env.VITE_SITE_URL || 'https://admin.ileala.ae'),
    'import.meta.env.VITE_FRONTEND_FORGE_API_URL': JSON.stringify(env.VITE_FRONTEND_FORGE_API_URL || 'https://www.ileala.ae'),
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
    'import.meta.env.VITE_OAUTH_PORTAL_URL': JSON.stringify(env.VITE_OAUTH_PORTAL_URL || ''),
    'import.meta.env.VITE_LEGACY_BUILD': JSON.stringify(env.VITE_LEGACY_BUILD || 'true'),
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY || ''),
    // Explicitly disable Sanity to prevent old code from being included
    'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify(''),
    'import.meta.env.VITE_SANITY_DATASET': JSON.stringify(''),
    'import.meta.env.VITE_SANITY_API_VERSION': JSON.stringify(''),
  },
};
});
