import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  test: {
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.jsonc",
        },
      },
    },
  },
});
