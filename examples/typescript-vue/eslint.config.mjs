import pluginVue from 'eslint-plugin-vue';
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
      files: ['*.vue', '**/*.vue'],
      languageOptions: {
          parserOptions: {
              parser: tseslint.parser
          }
      }
  }
];
