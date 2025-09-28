// @ts-check
/* global require, module */

const eslint = require("@eslint/js");
const typescriptEslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

function baseConfig(languageOptions) {
  return [
    eslint.configs.recommended,
    eslintConfigPrettier,
    {
      plugins: {
        ts: typescriptEslint.plugin,
      },
      ignores: ["node_modules"],
      rules: {
        "no-unused-vars": "off",
        "no-array-constructor": "error",
        "prefer-template": "error",
        "no-unused-expressions": "off",
        "no-redeclare": "off", // we use "ts/no-redeclare"

        "ts/no-redeclare": "error",
        "ts/ban-ts-comment": "error",
        "ts/consistent-type-imports": "error",
        "ts/consistent-type-exports": "error",
        "ts/no-require-imports": "error",
        "ts/no-empty-object-type": "error",
        "ts/no-duplicate-enum-values": "error",
        "ts/no-explicit-any": "off",
        "ts/no-extra-non-null-assertion": "error",
        "ts/no-misused-new": "error",
        "ts/no-namespace": "error",
        "ts/no-non-null-asserted-optional-chain": "error",
        "ts/no-this-alias": "error",
        "ts/no-unnecessary-type-constraint": "error",
        "ts/no-unsafe-declaration-merging": "error",
        "ts/no-unsafe-function-type": "error",
        "ts/no-unused-expressions": "error",
        "ts/no-unused-vars": "error",
        "ts/no-wrapper-object-types": "error",
        "ts/prefer-as-const": "error",
        "ts/prefer-namespace-keyword": "error",
        "ts/triple-slash-reference": "error"
      },
      files: ["**/*.ts"],
      languageOptions
    }
  ];
}

module.exports = baseConfig;
