import baseConfig, { mergeConfig } from "@probing/vitest-config";

export default mergeConfig(baseConfig, {
  test: {
    include: ["./test/api/**/*.test.ts"],
  },
});
