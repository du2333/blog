import { tanstackConfig } from "@tanstack/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig({
  extends: [...tanstackConfig],
  ignores: ["worker-configuration.d.ts", ".wrangler/**"],
  rules: {
    "@typescript-eslint/require-await": "off",
  },
});
