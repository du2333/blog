import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import viteDark from "shiki/themes/vitesse-dark.mjs";
import viteLight from "shiki/themes/vitesse-light.mjs";
import wasm from "shiki/wasm";

import bash from "shiki/langs/bash.mjs";
import c from "shiki/langs/c.mjs";
import cpp from "shiki/langs/cpp.mjs";
import csharp from "shiki/langs/csharp.mjs";
import css from "shiki/langs/css.mjs";
import dockerfile from "shiki/langs/dockerfile.mjs";
import go from "shiki/langs/go.mjs";
import html from "shiki/langs/html.mjs";
import java from "shiki/langs/java.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsx from "shiki/langs/jsx.mjs";
import kotlin from "shiki/langs/kotlin.mjs";
import markdown from "shiki/langs/markdown.mjs";
import php from "shiki/langs/php.mjs";
import python from "shiki/langs/python.mjs";
import ruby from "shiki/langs/ruby.mjs";
import rust from "shiki/langs/rust.mjs";
import shell from "shiki/langs/shell.mjs";
import sql from "shiki/langs/sql.mjs";
import swift from "shiki/langs/swift.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import xml from "shiki/langs/xml.mjs";
import yaml from "shiki/langs/yaml.mjs";

export const languages = [
  bash,
  c,
  cpp,
  csharp,
  css,
  dockerfile,
  go,
  html,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  markdown,
  php,
  python,
  ruby,
  rust,
  shell,
  sql,
  swift,
  tsx,
  typescript,
  xml,
  yaml,
];

export const themes = {
  light: "vitesse-light",
  dark: "vitesse-dark",
} as const;

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null;

export async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [viteDark, viteLight],
      langs: languages,
      engine: createOnigurumaEngine(wasm),
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: string) {
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
 * Get tokens for ProseMirror decorations with dual-theme support
 */
export async function codeToTokens(code: string, lang: string) {
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
