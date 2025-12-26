import { CloudflareEnvService } from "./cloudflare-env";
import { CloudflareExecutionContextService } from "./cloudflare-env";
import { D1Service } from "./d1";
import { KVService } from "./kv";
import { R2Service } from "./r2";
import { DatabaseService } from "./db";
import { AuthService } from "./auth";
import { ManagedRuntime, Layer } from "effect";

export function createAppRuntime(env: Env, executionCtx: ExecutionContext) {
  const requestLayer = Layer.mergeAll(
    CloudflareEnvService.Live(env),
    CloudflareExecutionContextService.Live(executionCtx)
  );

  const resourceLayer = Layer.mergeAll(
    D1Service.Live,
    KVService.Live,
    R2Service.Live
  ).pipe(Layer.provide(requestLayer));

  const databaseLayer = DatabaseService.Live.pipe(
    Layer.provide(requestLayer)
  );

  const authLayer = AuthService.Live.pipe(
    Layer.provide(requestLayer)
  );

  const appLayer = Layer.mergeAll(
    requestLayer,
    resourceLayer,
    databaseLayer,
    authLayer
  );

  return ManagedRuntime.make(appLayer);
}

export type AppRuntime = ReturnType<typeof createAppRuntime>;
export type AppServices =
  | CloudflareEnvService
  | CloudflareExecutionContextService
  | D1Service
  | KVService
  | R2Service
  | DatabaseService
  | AuthService;
