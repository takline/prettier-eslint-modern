import pluginVue from 'eslint-plugin-vue';
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/essential'],
];
