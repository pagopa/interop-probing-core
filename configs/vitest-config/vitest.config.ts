import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["dotenv-flow/config"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    pool: "forks",
  },
});
