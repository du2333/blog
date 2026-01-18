import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import viteDark from "shiki/themes/vitesse-dark.mjs";
import viteLight from "shiki/themes/vitesse-light.mjs";
import type { HighlighterCore, LanguageRegistration } from "shiki/core";

// Shiki language modules export `default` as an array of LanguageRegistration
type LanguageModule = { default: Array<LanguageRegistration> };

const languageLoaders: Record<
  string,
  (() => Promise<LanguageModule>) | undefined
> = {
  bash: () => import("shiki/langs/bash.mjs"),
  c: () => import("shiki/langs/c.mjs"),
  cpp: () => import("shiki/langs/cpp.mjs"),
  csharp: () => import("shiki/langs/csharp.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  dockerfile: () => import("shiki/langs/dockerfile.mjs"),
  go: () => import("shiki/langs/go.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  java: () => import("shiki/langs/java.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  kotlin: () => import("shiki/langs/kotlin.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  php: () => import("shiki/langs/php.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  ruby: () => import("shiki/langs/ruby.mjs"),
  rust: () => import("shiki/langs/rust.mjs"),
  shell: () => import("shiki/langs/shell.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  swift: () => import("shiki/langs/swift.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
};

export const themes = {
  light: "vitesse-light",
  dark: "vitesse-dark",
} as const;

let highlighterPromise: Promise<HighlighterCore> | null = null;

export async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [viteDark, viteLight],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export async function loadLanguage(lang: string) {
  const highlighter = await getHighlighter();
  if (highlighter.getLoadedLanguages().includes(lang)) {
    return;
  }

  const loader = languageLoaders[lang];
  if (loader) {
    const langModule = await loader();
    await highlighter.loadLanguage(...langModule.default);
  }
}

export async function highlight(code: string, lang: string) {
  await loadLanguage(lang);
  const highlighter = await getHighlighter();
  const supportedLangs = highlighter.getLoadedLanguages();
  const safeLang = supportedLangs.includes(lang) ? lang : "text";

  try {
    return highlighter.codeToHtml(code, {
      lang: safeLang,
      themes: {
        dark: themes.dark,
        light: themes.light,
      },
    });
  } catch (e) {
    console.warn(`Failed to highlight language: ${lang}`, e);
    return `<pre><code>${code}</code></pre>`;
  }
}

/**
 * Get tokens for ProseMirror decorations with dual-theme support.
 * Loads the language lazily if not already loaded.
 */
export async function codeToTokens(code: string, lang: string) {
  await loadLanguage(lang);
  const highlighter = await getHighlighter();

  const supportedLangs = highlighter.getLoadedLanguages();
  const safeLang = supportedLangs.includes(lang) ? lang : "plaintext";

  return highlighter.codeToTokens(code, {
    lang: safeLang,
    themes: {
      light: themes.light,
      dark: themes.dark,
    },
  });
}
