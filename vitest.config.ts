import babel from "vite-plugin-babel"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    // Babel will try to pick up Babel config files (.babelrc or .babelrc.json)
    babel(),
    // ...
  ],
  test: {
    setupFiles: "./vitestSetup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
      exclude: [
        ...(configDefaults.coverage.exclude
          ? configDefaults.coverage.exclude
          : []),
        "typedoc.cjs",
        "src/types-internal.ts",
        "src/types.ts",
        "src/index.ts",
      ],
    },
  },
})
