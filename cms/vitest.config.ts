import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom" },
  resolve: {
    alias: {
      "@site": fileURLToPath(new URL("..", import.meta.url)),
      "@": fileURLToPath(new URL("./src/renderer/src", import.meta.url)),
      zod: fileURLToPath(new URL("../node_modules/zod", import.meta.url)),
    },
  },
});
