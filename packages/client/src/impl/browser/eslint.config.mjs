import globals from "globals";

export default [{
    languageOptions: {
        globals: {
            ...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, "off"])),
            ...globals.browser,
        },
    },
}];