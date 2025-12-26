import { Context, Effect, Layer } from "effect";
import { DB, getDb } from "@/lib/db";
import { D1Service } from "./d1";

export class DatabaseService extends Context.Tag(
	"./services/db/DatabaseService",
)<DatabaseService, { db: DB }>() {
	static readonly Live = Layer.effect(
		this,
		Effect.gen(function* () {
			const { d1 } = yield* D1Service;
			return { db: getDb(d1) };
		}),
	).pipe(Layer.provide(D1Service.Live));
}
