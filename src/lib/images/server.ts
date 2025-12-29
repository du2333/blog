import { getContentTypeFromKey } from "@/lib/images/utils";

export async function handleImageRequest(
	env: Env,
	key: string,
	request: Request,
) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	const serveOriginal = async () => {
		const object = await env.R2.get(key);
		if (!object) {
			return new Response("Image not found", { status: 404 });
		}

		const contentType
			= object.httpMetadata?.contentType
				|| getContentTypeFromKey(key)
				|| "application/octet-stream";

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("Content-Type", contentType);
		headers.set("ETag", object.httpEtag);

		return new Response(object.body as ReadableStream, { headers });
	};

	// 1. 防止循环调用 & 显式请求原图
	const viaHeader = request.headers.get("via");
	const isLoop = viaHeader && /image-resizing/.test(viaHeader);
	const wantsOriginal = searchParams.get("original") === "true";

	if (isLoop || wantsOriginal) {
		return await serveOriginal();
	}

	// 2. 构建 Cloudflare Image Resizing 参数
	const transformOptions = buildTransformOptions(
		searchParams,
		request.headers.get("Accept") || "",
	);

	// 3. 尝试进行图片处理
	try {
		const origin = url.origin;
		const sourceImageUrl = `${origin}/images/${key}?original=true`;

		const imageRequest = new Request(sourceImageUrl, {
			headers: request.headers,
		});

		// 调用 Cloudflare Images 变换
		const response = await fetch(imageRequest, {
			cf: { image: transformOptions },
		});

		// 如果变换失败 (如格式不支持)，降级回原图
		if (!response.ok) {
			return await serveOriginal();
		}

		// 4. 返回处理后的图片
		const newHeaders = new Headers(response.headers);

		// 清理掉可能存在的上游缓存头，确保干净
		newHeaders.delete("Cache-Control");
		newHeaders.delete("CDN-Cache-Control");
		if (!newHeaders.has("Vary")) {
			newHeaders.set("Vary", "Accept");
		}

		return new Response(response.body, {
			status: response.status,
			headers: newHeaders,
		});
	}
	catch (e) {
		console.error("Image transform failed:", e);
		return await serveOriginal();
	}
}
function buildTransformOptions(searchParams: URLSearchParams, accept: string) {
	const transformOptions: Record<string, unknown> = { quality: 80 };

	if (searchParams.has("width"))
		transformOptions.width = Number.parseInt(searchParams.get("width")!, 10);
	if (searchParams.has("height"))
		transformOptions.height = Number.parseInt(searchParams.get("height")!, 10);
	if (searchParams.has("quality"))
		transformOptions.quality = Number.parseInt(searchParams.get("quality")!, 10);
	if (searchParams.has("fit"))
		transformOptions.fit = searchParams.get("fit");

	if (/image\/avif/.test(accept)) {
		transformOptions.format = "avif";
	}
	else if (/image\/webp/.test(accept)) {
		transformOptions.format = "webp";
	}

	return transformOptions;
}
