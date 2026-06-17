import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      all: true,
      include: [
        "src/lib/**",
        "src/state/appReducer.js",
        "src/hooks/useCalculatorForm.js",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    // Setup file for React Testing Library utilities if needed
    setupFiles: ["./vitest.setup.js"],
  },
});
