import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  root: rootDir,
  publicDir: "public",
  plugins: [vue()],
  css: { postcss: { plugins: [] } },
  appType: "spa",
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  build: {
    outDir: "../public/novel-agent-demo",
    emptyOutDir: true,
  },
});
