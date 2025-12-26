import { Effect } from "effect";
import type { AppRuntime, AppServices } from "@/services";

export type ApiResult<D, E> = { ok: true; data: D } | { ok: false; error: E };

export function toApiResult<A, E, R>(
	effect: Effect.Effect<A, E, R>,
): Effect.Effect<ApiResult<A, E>, never, R> {
	return Effect.match(effect, {
		onSuccess: (data) => ({ ok: true as const, data }),
		onFailure: (error) => ({ ok: false as const, error }),
	});
}

export function runApiEffectWithRuntime<A, E, R extends AppServices>(
	runtime: AppRuntime,
	effect: Effect.Effect<A, E, R>,
) {
	return runtime.runPromise(toApiResult(effect));
}

export type RunApiEffectWithRuntime = <A, E, R extends AppServices>(
	effect: Effect.Effect<A, E, R>,
) => Promise<ApiResult<A, E>>;

export const createRunEffect =
	(runtime: AppRuntime): RunApiEffectWithRuntime =>
	(effect) =>
		runApiEffectWithRuntime(runtime, effect);
