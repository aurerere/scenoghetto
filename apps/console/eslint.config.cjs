// @ts-check
/* global __dirname */
const baseConfig = require("../../eslint.config.base.js");
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const typescriptEslintParser = require("@typescript-eslint/parser");

module.exports = [
  ...baseConfig({
    globals: globals.browser,
    ecmaVersion: 2020,
    parser: typescriptEslintParser,
    parserOptions: {
      project: "./tsconfig.app.json",
      tsconfigRootDir: __dirname,
    },
  }),
  { ignores: ["dist"] },
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": ["error"],
    },
  },
];
