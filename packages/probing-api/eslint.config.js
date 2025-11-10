import baseConfig from "@probing/eslint-config/backend";
import eslintIgnores from "@probing/eslint-config/ignores";

export default [
  eslintIgnores,
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.check.json",
      },
    },
  },
];
