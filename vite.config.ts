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
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
