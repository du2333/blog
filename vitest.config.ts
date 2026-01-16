import path from "node:path";
import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig(async () => {
  // 读取 migrations 目录下的所有迁移文件
  const migrationsPath = path.join(__dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    test: {
      setupFiles: ["./tests/apply-migrations.ts"],
      poolOptions: {
        workers: {
          singleWorker: true,
          wrangler: {
            configPath: "./wrangler.jsonc",
            environment: "test",
          },
          miniflare: {
            // 将迁移文件绑定到 TEST_MIGRATIONS，供 applyMigrations() 使用
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
