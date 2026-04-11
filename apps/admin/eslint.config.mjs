import { nextJsConfig } from "@animora/eslint-config/next-js";
import { defineConfig } from "eslint/config";

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
