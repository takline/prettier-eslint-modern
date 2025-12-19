import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        rules: {
            "quotes": ["error", "single"],
            "semi": ["error", "never"],
            "indent": ["error", 4]
        }
    }
];
