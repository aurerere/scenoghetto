import { defineConfig } from "vite";

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
});
