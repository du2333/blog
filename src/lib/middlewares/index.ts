import { createMiddleware, createServerFn, json } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { CACHE_CONTROL } from "@/lib/cache/cache-control";

export const authMiddleware = createMiddleware().server(
	async ({ next, context, request }) => {
		const session = await context.auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			throw json({ message: "UNAUTHENTICATED" }, { status: 401 });
		}

		return next({
			context: {
				session,
			},
		});
	},
);

export const adminMiddleware = createMiddleware()
	.middleware([authMiddleware])
	.server(async ({ next, context }) => {
		const session = context.session;

		if (session.user?.role !== "admin") {
			throw json({ message: "PERMISSION_DENIED" }, { status: 403 });
		}

		return next({
			context: {
				session,
			},
		});
	});

export const cachedMiddleware = createMiddleware().server(async ({ next }) => {
	const result = await next();

	Object.entries(CACHE_CONTROL.public).forEach(([k, v]) => {
		setResponseHeader(k, v);
	});

	return result;
});

export const createAuthedFn = createServerFn().middleware([authMiddleware]);
export const createAdminFn = createServerFn().middleware([adminMiddleware]);
export const createCachedFn = createServerFn().middleware([cachedMiddleware]);
