import baseConfig from "@probing/eslint-config/backend";
import eslintIgnores from "@probing/eslint-config/ignores";

export default [
  { ignores: [...eslintIgnores.ignores, "eslint.config.js"] },
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.check.json",
      },
    },
  },
];
