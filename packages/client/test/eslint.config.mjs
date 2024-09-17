import globals from "globals";

export default [{
    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    rules: {
        "@typescript-eslint/no-unused-expressions": "warn",
    },
}];