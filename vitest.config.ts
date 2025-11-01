import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html", "json-summary"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "demo/**",
        "tests/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.d.ts",
        "vitest.config.ts",
        "vitest.setup.ts",
        "scripts/**",
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
});








