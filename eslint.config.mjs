import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslintEslintPlugin,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.mocha,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {},
        },
    },

    rules: {
        "no-console": "off",

        "@typescript-eslint/naming-convention": ["error", {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE"],

            filter: {
                regex: "^DEFAULT_|^Log$",
                match: false,
            },

            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
        }, {
            selector: "typeLike",
            format: ["PascalCase"],
        }],

        "@typescript-eslint/no-explicit-any": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "prefer-template": "error",

        "@typescript-eslint/explicit-module-boundary-types": ["error", {
            allowArgumentsExplicitlyTypedAsAny: true,
        }],

        "@typescript-eslint/no-non-null-assertion": "error",
    },
}];