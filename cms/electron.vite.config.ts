import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// L'app partage content/registry.ts avec le site : alias vers la racine du
// repo, et zod aliasé vers l'instance de la racine (une seule instance).
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const sharedAliases = {
  "@site": repoRoot,
  "@": fileURLToPath(new URL("./src/renderer/src", import.meta.url)),
  zod: fileURLToPath(new URL("../node_modules/zod", import.meta.url)),
};

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react()],
    resolve: { alias: sharedAliases },
    // Autorise Vite à servir des fichiers hors de cms/ (content/registry.ts).
    server: { fs: { allow: [repoRoot] } },
  },
});
