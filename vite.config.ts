import { defineConfig, createLogger } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const logger = createLogger();
const customLogger = {
  ...logger,
  warn(msg, options) {
    if (typeof msg === "string" && msg.includes("PostCSS plugin") && msg.includes("from")) return;
    logger.warn(msg, options);
  },
};

// Suppress PostCSS "from" warning (comes from a dependency, not our config)
function suppressPostCssWarning() {
  const orig = console.warn;
  return {
    name: "suppress-postcss-warning",
    buildStart() {
      console.warn = (...args: unknown[]) => {
        const msg = String(args[0] ?? "");
        if (msg.includes("PostCSS plugin") && msg.includes("from")) return;
        orig.apply(console, args);
      };
    },
    buildEnd() {
      console.warn = orig;
    },
  };
}

export default defineConfig({
  plugins: [suppressPostCssWarning(), react()],
  customLogger,
  css: {
    devSourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
