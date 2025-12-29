import { serverEnv } from "@/lib/env/server.env";

/**
 * Purge CDN cache for specific paths
 * @param env - Environment variables
 * @param paths - Array of paths to purge (e.g., ["/post/my-slug", "/blog", "/"])
 * @returns Promise that resolves when purge is complete
 */
export async function purgeCDNCache(env: Env, paths: string[]) {
	const { CLOUDFLARE_ZONE_ID, CLOUDFLARE_PURGE_API_TOKEN, DOMAIN }
		= serverEnv(env);

	// Build full URLs with proper encoding
	const urls = paths.map((path) => {
		// Split path into segments, encode each segment, then rejoin
		const segments = path
			.split("/")
			.map(segment => (segment ? encodeURIComponent(segment) : segment));
		return `https://${DOMAIN}${segments.join("/")}`;
	});

	const response = await fetch(
		`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
		{
			method: "POST",
			headers: {
				"Authorization": `Bearer ${CLOUDFLARE_PURGE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ files: urls }),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Cloudflare Purge API failed:", response.status, errorText);
	}
}

/**
 * Purge CDN cache for a post and related pages
 * Called after publishing or deleting a post
 * @param env - Environment variables
 * @param slug - Post slug
 */
export async function purgePostCDNCache(env: Env, slug: string) {
	const { ENVIRONMENT } = serverEnv(env);
	if (ENVIRONMENT === "dev") {
		console.log("Skipping CDN cache purge in development environment");
		return;
	}

	return purgeCDNCache(env, [
		`/post/${slug}`, // 文章详情页
		`/blog`, // 文章页
		`/`, // 首页
	]);
}
