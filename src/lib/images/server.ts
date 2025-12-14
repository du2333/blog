import { getContentTypeFromKey } from "@/lib/images/utils";

export async function handleImageRequest(
  env: Env,
  key: string,
  request: Request
) {
  const viaHeader = request.headers.get("via");

  // 1. 防止循环调用
  if (viaHeader && /image-resizing/.test(viaHeader)) {
    return await getOriginalImage(key, env);
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // 2. 如果请求原图，直接走流式返回
  if (searchParams.get("original") === "true") {
    return await getOriginalImage(key, env);
  }

  // 3. 构建参数对象给 Cloudflare
  const transformOptions = buildTransformOptions(
    searchParams,
    request.headers.get("Accept") || ""
  );

  // 4. 应用 transformation
  try {
    const origin = url.origin;
    const sourceImageUrl = `${origin}/images/${key}?original=true`;

    const imageRequest = new Request(sourceImageUrl, {
      headers: request.headers,
    });

    const response = await fetch(imageRequest, {
      cf: { image: transformOptions },
    });

    if (!response.ok) {
      return await getOriginalImage(key, env);
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    newHeaders.set("Vary", "Accept");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (e) {
    return await getOriginalImage(key, env);
  }
}

function buildTransformOptions(searchParams: URLSearchParams, accept: string) {
  const transformOptions: Record<string, unknown> = { quality: 80 };

  if (searchParams.has("width"))
    transformOptions.width = parseInt(searchParams.get("width")!, 10);
  if (searchParams.has("height"))
    transformOptions.height = parseInt(searchParams.get("height")!, 10);
  if (searchParams.has("quality"))
    transformOptions.quality = parseInt(searchParams.get("quality")!, 10);
  if (searchParams.has("fit")) transformOptions.fit = searchParams.get("fit");

  if (/image\/avif/.test(accept)) {
    transformOptions.format = "avif";
  } else if (/image\/webp/.test(accept)) {
    transformOptions.format = "webp";
  } else {
    transformOptions.format = "auto";
  }

  return transformOptions;
}

async function getOriginalImage(key: string, env: Env) {
  const object = await env.R2.get(key);

  if (!object) {
    return new Response("Image not found", {
      status: 404,
    });
  }

  const contentType =
    object.httpMetadata?.contentType ||
    getContentTypeFromKey(key) ||
    "application/octet-stream";

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", contentType);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body as ReadableStream, {
    headers,
  });
}
