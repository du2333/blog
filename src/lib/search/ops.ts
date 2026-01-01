import { insert, remove, search } from "@orama/orama";
import type { JSONContent } from "@tiptap/react";
import type { MyOramaDB } from "@/lib/search/schema";
import { convertToPlainText } from "@/lib/editor/utils";
import { getOramaDb, persistOramaDb } from "@/lib/search/loader";

const CONTENT_SLICE = 10000;
const SNIPPET_SLICE = 200;
const SNIPPET_CONTEXT = 60;
const SCAN_LIMIT = CONTENT_SLICE; // scan up to the same slice that gets indexed to avoid ghost hits
const FUZZY_MAX_DISTANCE = 1;

interface UpsertInput {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  contentJson?: JSONContent | null;
}

export async function addOrUpdateSearchDoc(env: Env, input: UpsertInput) {
  const db = await getOramaDb(env);
  await removeById(db, input.id);
  const plain = convertToPlainText(input.contentJson ?? null);
  const content =
    plain.length > CONTENT_SLICE ? plain.slice(0, CONTENT_SLICE) : plain;
  const summary =
    input.summary && input.summary.trim().length > 0
      ? input.summary
      : content.slice(0, SNIPPET_SLICE);

  await insert(db, {
    id: input.id.toString(),
    slug: input.slug,
    title: input.title,
    summary,
    content,
  });

  await persistOramaDb(env, db);
  return { id: input.id };
}

export async function deleteSearchDoc(env: Env, id: number | string) {
  const db = await getOramaDb(env);
  await removeById(db, id);
  await persistOramaDb(env, db);
  return { id };
}

type OramaHit = Awaited<ReturnType<typeof search>>["hits"][number];

export async function searchDocs(env: Env, query: string, limit = 10) {
  const db = await getOramaDb(env);
  const result = await search(db, {
    term: query,
    limit: Math.min(limit, 25),
  });

  return result.hits.map((hit) => {
    const { document, score } = hit;
    const titleHighlight = buildSnippet({
      text: document.title,
      terms: getMatchedTerms(hit, "title"),
      fallbackTerm: query,
    });
    const summaryHighlight = buildSnippet({
      text: document.summary,
      terms: getMatchedTerms(hit, "summary"),
      fallbackTerm: query,
    });
    const contentHighlight = buildSnippet({
      text: document.content,
      terms: getMatchedTerms(hit, "content"),
      fallbackTerm: query,
    });

    return {
      post: {
        id: document.id,
        slug: document.slug,
        title: document.title,
        summary: document.summary,
        category: document.category,
      },
      score,
      matches: {
        title: titleHighlight,
        summary: summaryHighlight,
        contentSnippet: contentHighlight,
      },
    };
  });
}

function buildSnippet({
  text,
  terms,
  fallbackTerm,
}: {
  text?: string | null;
  terms: Array<string>;
  fallbackTerm: string;
}) {
  const source = text?.trim() ?? "";
  if (source.length === 0) return null;

  const activeTerms =
    terms.length > 0 ? terms : fallbackTerm ? [fallbackTerm] : [];

  if (activeTerms.length === 0) {
    return source.slice(0, SNIPPET_SLICE);
  }

  const lowerSource = source.toLowerCase();
  const match =
    findExactMatch(source, lowerSource, activeTerms) ??
    findApproxMatch(source, activeTerms, SCAN_LIMIT, FUZZY_MAX_DISTANCE);

  if (!match) {
    return source.slice(0, SNIPPET_SLICE);
  }

  const { idx, len, token } = match;

  const start = idx === -1 ? 0 : Math.max(0, idx - SNIPPET_CONTEXT);
  const end =
    idx === -1
      ? Math.min(source.length, SNIPPET_SLICE)
      : Math.min(source.length, idx + len + SNIPPET_CONTEXT);

  const slice = source.slice(start, end);
  const safeSlice = escapeHtml(slice);

  const highlightTerms = [token, ...activeTerms]
    .filter((t) => t && t.length > 0)
    .map((t) => escapeRegExp(escapeHtml(t)));

  const highlightRegex = new RegExp(highlightTerms.join("|"), "gi");

  const highlighted = safeSlice.replace(
    highlightRegex,
    (match) => `<mark>${match}</mark>`,
  );

  return highlighted;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMatchedTerms(
  hit: OramaHit,
  field: "title" | "summary" | "content",
) {
  const maybeMatches = (
    hit as { matches?: Record<string, Array<{ term?: string }>> }
  ).matches;
  if (!maybeMatches) return [];
  const fieldMatches = maybeMatches[field];
  if (!Array.isArray(fieldMatches)) return [];
  return fieldMatches
    .map((m) => m.term)
    .filter((t): t is string => typeof t === "string" && t.length > 0);
}

function findExactMatch(
  source: string,
  lowerSource: string,
  terms: Array<string>,
): { idx: number; len: number; token: string } | null {
  for (const term of terms) {
    const lowerTerm = term.toLowerCase();
    const exactIdx = lowerSource.indexOf(lowerTerm);
    if (exactIdx !== -1) {
      const expanded = expandToWordBounds(source, exactIdx, lowerTerm.length);
      return expanded;
    }
  }
  return null;
}

function findApproxMatch(
  source: string,
  terms: Array<string>,
  scanLimit: number,
  maxDistance: number,
): { idx: number; len: number; token: string } | null {
  const chunk = source.slice(0, Math.min(scanLimit, source.length));
  const lowerChunk = chunk.toLowerCase();

  for (const term of terms) {
    const lowerTerm = term.toLowerCase();
    const baseLen = lowerTerm.length;
    const lens = [baseLen - 1, baseLen, baseLen + 1].filter((l) => l > 0);

    for (const winLen of lens) {
      const limit = lowerChunk.length - winLen;
      if (limit < 0) continue;

      for (let i = 0; i <= limit; i++) {
        // quick filter: first char should match to reduce cost
        if (lowerChunk[i] !== lowerTerm[0]) continue;
        const candidate = lowerChunk.slice(i, i + winLen);
        if (
          levenshteinWithCutoff(candidate, lowerTerm, maxDistance) > maxDistance
        ) {
          continue;
        }
        const expanded = expandToWordBounds(chunk, i, winLen);
        return expanded;
      }
    }
  }

  return null;
}

function expandToWordBounds(
  source: string,
  idx: number,
  len: number,
): { idx: number; len: number; token: string } {
  const isWord = (ch: string) => /\w/.test(ch);
  let start = idx;
  let end = idx + len;
  while (start > 0 && isWord(source[start - 1])) start--;
  while (end < source.length && isWord(source[end])) end++;
  return { idx: start, len: end - start, token: source.slice(start, end) };
}

function levenshteinWithCutoff(a: string, b: string, max: number): number {
  const aLen = a.length;
  const bLen = b.length;
  if (Math.abs(aLen - bLen) > max) return max + 1;
  const prev = Array.from({ length: bLen + 1 }, () => 0);
  const curr = Array.from({ length: bLen + 1 }, () => 0);
  for (let j = 0; j <= bLen; j++) prev[j] = j;
  for (let i = 1; i <= aLen; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost, // substitution
      );
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= bLen; j++) prev[j] = curr[j];
  }
  return curr[bLen];
}

async function removeById(db: MyOramaDB, id: number | string) {
  try {
    await remove(db, id.toString());
  } catch {
    // ignore missing
  }
}
