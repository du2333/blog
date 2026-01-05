import { serverEnv } from "@/lib/env/server.env";

interface PurgeOptions {
  urls?: Array<string>; // 精确匹配的URL
  prefixes?: Array<string>; // 前缀匹配的URL
}

export async function purgeCDNCache(env: Env, options: PurgeOptions) {
  const { CLOUDFLARE_ZONE_ID, CLOUDFLARE_PURGE_API_TOKEN, DOMAIN } =
    serverEnv(env);

  const baseUrl = `https://${DOMAIN}`;

  const payload: { files?: Array<string>; prefixes?: Array<string> } = {};

  if (options.urls && options.urls.length > 0) {
    payload.files = options.urls.flatMap((path) => {
      const fullPath = `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
      if (path === "/" || path === "") return [`${baseUrl}/`];
      return [fullPath, `${fullPath}/`];
    });
  }

  if (options.prefixes && options.prefixes.length > 0) {
    payload.prefixes = options.prefixes.map(path => {
      return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
    });
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_PURGE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cloudflare Purge API failed:", response.status, errorText);
    throw new Error(`Cloudflare Purge API failed: ${errorText}`);
  }
}

export async function purgePostCDNCache(env: Env, slug: string) {
  const { ENVIRONMENT } = serverEnv(env);
  if (ENVIRONMENT === "dev") {
    console.log("Skipping CDN cache purge in development environment");
    return;
  }

  return purgeCDNCache(env, {
    urls: [`/post/${slug}`, "/blog", "/"],
    prefixes: ["/_serverFn/"],
  });
}
