export function isValidUrl(url: string) {
  return /^https?:\/\/\S+$/.test(url);
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) {
    return str;
  }
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    return null;
  }
}

export function slugify(text: string) {
  if (!text) return "";

  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // 1. 把所有空格 (space) 和下划线 (_) 替换为横杠 (-)
      .replace(/[\s_]+/g, "-")

      // 2. 核心正则：移除所有 "非" 允许字符
      // ^      : 取反
      // a-z0-9 : 英文和数字
      // \-     : 横杠
      // \u4e00-\u9fa5 : 汉字的标准 Unicode 范围 (基本覆盖所有常用字)
      .replace(/[^a-z0-9\-\u4e00-\u9fa5]+/g, "")

      // 3. 处理连续的横杠 (比如 "Hello... World" 会变成 "hello---world"，这里修正为 "hello-world")
      .replace(/\-\-+/g, "-")

      // 4. 去除开头和结尾的横杠
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  );
}