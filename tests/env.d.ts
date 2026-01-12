declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    // 由 vitest.config.ts 通过 miniflare bindings 注入的迁移数据
    TEST_MIGRATIONS: Array<D1Migration>;
  }
}
