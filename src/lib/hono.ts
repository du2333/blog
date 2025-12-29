import handler from "@tanstack/react-start/server-entry";
import { Hono } from "hono";
import { getAuth } from "@/lib/auth/auth.server";
import { CACHE_CONTROL } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { handleImageRequest } from "@/lib/images/server";

export const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
	await next();

	const cacheStatus = c.res.headers.get("cf-cache-status");
	c.executionCtx.waitUntil(
		(async () => {
			if (cacheStatus) {
				console.log("[CDN] Cache status:", cacheStatus);
			}
		})(),
	);

	// 只处理 GET 请求
	if (c.req.method !== "GET")
		return;

	const status = c.res.status;
	const path = c.req.path;
	const contentType = c.res.headers.get("Content-Type") || "";

	if (path.startsWith("/api/") || path.startsWith("/images/")) {
		return;
	}

	const isHtml = contentType.includes("text/html");
	if (!isHtml)
		return;

	if (status !== 404 && status < 500)
		return;

	const newHeaders = new Headers(c.res.headers);

	if (status === 404) {
		Object.entries(CACHE_CONTROL.notFound).forEach(([k, v]) =>
			newHeaders.set(k, v),
		);
	}
	else if (status >= 500) {
		Object.entries(CACHE_CONTROL.serverError).forEach(([k, v]) =>
			newHeaders.set(k, v),
		);
	}

	c.res = new Response(c.res.body, {
		status: c.res.status,
		statusText: c.res.statusText,
		headers: newHeaders,
	});
});

app.get("/images/:key", async (c) => {
	const key = c.req.param("key");

	if (!key)
		return c.text("Image key is required", 400);

	try {
		const response = await handleImageRequest(c.env, key, c.req.raw);
		Object.entries(CACHE_CONTROL.immutable).forEach(([k, v]) =>
			response.headers.set(k, v),
		);
		return response;
	}
	catch (error) {
		console.error("Error fetching image from R2:", error);
		return c.text("Internal server error", 500);
	}
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	const db = getDb(c.env);
	const auth = getAuth({ db, env: c.env });
	return auth.handler(c.req.raw);
});

app.all("*", (c) => {
	const db = getDb(c.env);
	const auth = getAuth({ db, env: c.env });
	return handler.fetch(c.req.raw, {
		context: {
			db,
			auth,
			env: c.env,
			executionCtx: c.executionCtx,
		},
	});
});
