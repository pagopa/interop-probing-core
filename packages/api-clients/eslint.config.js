import baseConfig from "@probing/eslint-config/backend";
import eslintIgnores from "@probing/eslint-config/ignores";

export default [
  { ignores: [...eslintIgnores.ignores, "generate.ts"] },
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.check.json",
        ignores: ["**/generate.ts"],
      },
    },
  },
];
