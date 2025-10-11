import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 1337,
    proxy: {
      "/api": {
        target: "http://localhost:1339",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../desktop/public/console"),
    emptyOutDir: true,
  },
});
