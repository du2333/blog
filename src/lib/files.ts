export function getFileExtension(fileName: string): string | undefined {
  return fileName.split(".").pop();
}

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
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const uuid = crypto.randomUUID();
  const extension = getFileExtension(fileName);

  return `${year}/${month}/${day}/${uuid}.${extension}`;
}

export function extractImageKey(src: string): string | undefined {
  const prefix = "/images/";

  try {
    const key = new URL(src).pathname.replace(prefix, "");
    return key;
  } catch (error) {
    if (src.startsWith(prefix)) {
      return src.replace(prefix, "");
    }
    return undefined;
  }
}
