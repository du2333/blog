export function getContentTypeFromKey(key: string): string | undefined {
  const extension = key.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return contentTypes[extension || ""];
}

export function generateKey(fileName: string): string {
  const uuid = crypto.randomUUID();
  const extension = fileName.split(".").pop()?.toLowerCase() || "bin";

  return `${uuid}.${extension}`;
}

/**
 * 从图片 URL 中提取 R2 key
 * 支持格式：
 * - /images/${key}
 * - /images/${key}?quality=80&format=webp
 * - https://domain.com/images/${key}?quality=80
 */
export function extractImageKey(src: string): string | undefined {
  const prefix = "/images/";

  try {
    // 尝试解析为完整 URL
    const url = new URL(src);
    const pathname = url.pathname;
    if (pathname.startsWith(prefix)) {
      return pathname.replace(prefix, "");
    }
    return undefined;
  } catch (error) {
    // 如果不是完整 URL，尝试作为相对路径处理
    if (src.startsWith(prefix)) {
      // 移除查询参数（如果有）
      const withoutQuery = src.split("?")[0];
      return withoutQuery?.replace(prefix, "");
    }
    return undefined;
  }
}
