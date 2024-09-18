import globals from "globals";

export default [{
    ignores: ["dist/*.js", "**/generated/"],
}, {
    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    rules: {
        "no-console": "warn",
    },
}];