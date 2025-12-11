import { convertToPlainText } from "@/lib/editor-utils";
import { getOramaDb, persistOramaDb } from "@/lib/search/loader";
import type { MyOramaDB } from "@/lib/search/schema";
import { insert, remove, search } from "@orama/orama";
import type { JSONContent } from "@tiptap/react";

const CONTENT_SLICE = 10000;
const SNIPPET_SLICE = 200;
const SNIPPET_CONTEXT = 60;

type UpsertInput = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  contentJson?: JSONContent | null;
};

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

export async function searchDocs(env: Env, query: string, limit = 10) {
  const db = await getOramaDb(env);
  const result = await search(db, {
    term: query,
    limit: Math.min(limit, 25),
  });

  return result.hits.map(({ score, document }) => {
    const titleHighlight = buildSnippet(query, document.title);
    const summaryHighlight = buildSnippet(query, document.summary);
    const contentHighlight = buildSnippet(query, document.content);

    return {
      post: {
        id: document.id,
        slug: document.slug,
        title: document.title,
        summary: document.summary,
        category: document.category,
      },
      score: score,
      matches: {
        title: titleHighlight,
        summary: summaryHighlight,
        contentSnippet: contentHighlight,
      },
    };
  });
}

function buildSnippet(term: string, text?: string | null) {
  const source = text?.trim() ?? "";
  if (source.length === 0) return null;
  if (!term) return source.slice(0, SNIPPET_SLICE);

  const lowerSource = source.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const idx = lowerSource.indexOf(lowerTerm);

  const start = idx === -1 ? 0 : Math.max(0, idx - SNIPPET_CONTEXT);
  const end =
    idx === -1
      ? Math.min(source.length, SNIPPET_SLICE)
      : Math.min(source.length, idx + lowerTerm.length + SNIPPET_CONTEXT);

  const slice = source.slice(start, end);
  const safeSlice = escapeHtml(slice);

  const highlighted = safeSlice.replace(
    new RegExp(escapeRegExp(escapeHtml(term)), "ig"),
    (match) => `<mark>${match}</mark>`
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

async function removeById(db: MyOramaDB, id: number | string) {
  try {
    await remove(db, id.toString());
  } catch {
    // ignore missing
  }
}
