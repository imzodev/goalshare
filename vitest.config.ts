import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // jsdom para tests de UI (componentes React)
    // Para tests de lógica/utilidades puras, usar en el arquivo:
    //   // @vitest-environment node
    // Isso evita o overhead de jsdom quando não se precisa de DOM.
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
