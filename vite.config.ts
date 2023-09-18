import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react(), reactRefresh()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      // buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6", // add buffer
      events: "rollup-plugin-node-polyfills/polyfills/events",
      // stream: "rollup-plugin-node-polyfills/polyfills/stream",
      // util: "rollup-plugin-node-polyfills/polyfills/util",
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["stream/web", "util/types"],
  },
  build: {
    outDir: "./dist",
    target: "es2020",
    sourcemap: true,
  },
  server: {
    port: 7864,
    host: "0.0.0.0",
    fs: {
      allow: ["/"],
      strict: false,
    },
  },
  define: {
    "process.env": {},
  },
});
