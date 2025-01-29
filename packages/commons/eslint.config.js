import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    {
        ignores: ["eslint.config.js", "vitest.config.ts", "**/dist", "node_modules"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
            },
            globals: {
                process: "readonly",
                __dirname: "readonly",
                console: "readonly",
                setTimeout: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...prettier.rules,
            ...prettierPlugin.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,

            "@typescript-eslint/switch-exhaustiveness-check": "error",
            "default-case": "off",
            "prefer-arrow/prefer-arrow-functions": "off",
            "eqeqeq": ["error", "smart"],
            "@typescript-eslint/consistent-type-definitions": "off",
            "sort-keys": "off",
            "functional/prefer-readonly-type": "off",
            "@typescript-eslint/no-shadow": "off",
            "extra-rules/no-commented-out-code": "off",
            "max-lines-per-function": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/await-thenable": "off",
            "no-redeclare": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "no-console": "off",
            "no-undef": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "no-constant-condition": "off",
        },
    },
];
