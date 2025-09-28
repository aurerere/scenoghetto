// @ts-check
/* global require, module, __dirname */

const typescriptEslintParser = require("@typescript-eslint/parser");
const globals = require("globals");
const baseConfig = require("./eslint.config.base");

module.exports = [
  ...baseConfig({
    globals: {
      ...globals.node,
      ...globals.browser,
      ...globals.jest,
    },
    parser: typescriptEslintParser,
    parserOptions: {
      project: "./tsconfig.base.json",
      tsconfigRootDir: __dirname,
    },
    sourceType: "module",
  }),
];
