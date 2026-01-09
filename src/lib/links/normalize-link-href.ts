/**
 * Normalize a user-input href into a safe, clickable URL.
 *
 * Key behavior:
 * - Keeps absolute URLs as-is (http/https and other explicit schemes like mailto/tel).
 * - Keeps site-relative paths (/foo) and hash links (#foo) as-is.
 * - For "example.com" / "www.example.com" / "localhost:3000" style inputs, prefixes https://
 *   to avoid the browser treating them as relative paths under the current site.
 */
export function normalizeLinkHref(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  // Allow same-page anchors and site-relative URLs.
  if (input.startsWith("#") || input.startsWith("/")) return input;

  // Protocol-relative URLs (rare but valid).
  if (input.startsWith("//")) return input;

  // Keep explicit schemes (http://, https://, mailto:, tel:, etc).
  // NOTE: We intentionally require :// for generic schemes to avoid treating
  // "localhost:3000" as a "localhost:" scheme.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input)) return input;
  if (/^(mailto|tel|sms):/i.test(input)) return input;

  // Otherwise, treat as a host/path and default to https.
  return `https://${input}`;
}
