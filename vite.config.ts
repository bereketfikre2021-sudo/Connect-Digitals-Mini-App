import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // Required for multipart/form-data uploads (payment screenshots).
        // Increase timeouts and disable request body buffering so binary
        // payloads pass through the proxy stream without being reset.
        proxyTimeout: 60000,
        timeout: 60000,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("[vite-proxy] error:", err.message);
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — changes rarely, long cache lifetime
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data fetching — changes rarely
          "vendor-query": ["@tanstack/react-query"],
          // HTTP client
          "vendor-axios": ["axios"],
          // Form handling + validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // i18n — large, changes rarely
          "vendor-i18n": ["i18next", "react-i18next"],
          // Telegram SDK
          "vendor-twa": ["@twa-dev/sdk"],
        },
      },
    },
  },
});
