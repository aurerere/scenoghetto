import { defineConfig } from "vite";
import * as path from "node:path";

export default defineConfig({
  server: {
    port: 1338,
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
