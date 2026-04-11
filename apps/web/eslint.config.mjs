import { defineConfig } from "eslint/config";

import { nextJsConfig } from "@animora/eslint-config/next-js";

export default defineConfig([
  ...nextJsConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
