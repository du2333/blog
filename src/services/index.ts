import { Layer, ManagedRuntime } from "effect";
import { AuthService } from "./auth";
import {
	CloudflareEnvService,
	CloudflareExecutionContextService,
} from "./cloudflare-env";
import { D1Service } from "./d1";
import { DatabaseService } from "./db";
import { KVService } from "./kv";
import { R2Service } from "./r2";

export function createAppRuntime(env: Env, executionCtx: ExecutionContext) {
	const requestLayer = Layer.mergeAll(
		CloudflareEnvService.Live(env),
		CloudflareExecutionContextService.Live(executionCtx),
	);

	const resourceLayer = Layer.mergeAll(
		D1Service.Live,
		KVService.Live,
		R2Service.Live,
	).pipe(Layer.provide(requestLayer));

	const baseLayer = Layer.mergeAll(requestLayer, resourceLayer);

	const domainLayer = Layer.mergeAll(
		DatabaseService.Live,
		AuthService.Live,
	).pipe(Layer.provide(baseLayer));

	const appLayer = Layer.mergeAll(baseLayer, domainLayer);

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
