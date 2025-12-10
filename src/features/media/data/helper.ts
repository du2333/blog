export function escapeLikeString(str: string) {
  return str.replace(/[%_\\]/g, "\\$&");
}
