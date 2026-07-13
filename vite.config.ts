import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import sirv from "sirv";
import path from "node:path";
import { existsSync } from "node:fs";

/**
 * Serves the project-root `icons/` and `generated/` folders at `/icons`
 * and `/generated` during `vite dev`, without symlinking anything into
 * `public/` (symlinks don't survive every zip/archive tool, and this
 * folder can be 60,000+ files). For production, the same two folders are
 * copied into `dist/` by vite-plugin-static-copy at build time.
 */
function serveIconCollection(): Plugin {
  return {
    name: "serve-icon-collection",
    configureServer(server) {
      const iconsDir = path.resolve(__dirname, "icons");
      const generatedDir = path.resolve(__dirname, "generated");
      if (existsSync(iconsDir)) {
        server.middlewares.use("/icons", sirv(iconsDir, { dev: true, etag: true }));
      }
      if (existsSync(generatedDir)) {
        server.middlewares.use("/generated", sirv(generatedDir, { dev: true, etag: true }));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serveIconCollection(),
    viteStaticCopy({
      targets: [
        { src: "icons", dest: "." },
        { src: "generated", dest: "." },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
