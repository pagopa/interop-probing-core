import baseConfig, { mergeConfig } from "@probing/vitest-config";

const overrideConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    setupFiles: [],
  },
};

export default mergeConfig(overrideConfig, {
  test: {
    include: ["./test/api/**/*.test.ts"],
    globalSetup: ["./test/utilsSetupTestContainersGlobal.ts"],
  },
});
