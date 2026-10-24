import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// VITE_OUT_DIR : dossier de sortie du build (défaut "out"), utilisé par
// scripts/deploy-frontend.sh pour builder dans un dossier de release horodaté
// et permettre une bascule atomique (voir README, Déploiement).
// VITE_BASE_PATH reste utile si le site est un jour servi sous un sous-chemin.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const base = env.VITE_BASE_PATH ? `${env.VITE_BASE_PATH.replace(/\/$/, "")}/` : "/";

  return {
    base,
    plugins: [vue(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    build: { outDir: process.env.VITE_OUT_DIR ?? env.VITE_OUT_DIR ?? "out", emptyOutDir: true },
    test: { environment: "node", include: ["tests/**/*.test.ts"] },
  };
});
