import baseEslintConfig from "./eslint.config.js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseEslintConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
];
