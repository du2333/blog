import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import go from "@shikijs/langs/go";
import html from "@shikijs/langs/html";
import java from "@shikijs/langs/java";
import js from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import markdown from "@shikijs/langs/markdown";
import python from "@shikijs/langs/python";
import shell from "@shikijs/langs/shell";
import tsx from "@shikijs/langs/tsx";
import ts from "@shikijs/langs/typescript";
import xml from "@shikijs/langs/xml";
import yaml from "@shikijs/langs/yaml";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import { createJavaScriptRegexEngine } from "shiki";
import { createHighlighterCore } from "shiki/core";
import type { Highlighter } from "shiki";

export async function createHighlighter() {
  // 创建regex引擎
  const engine = await createJavaScriptRegexEngine({
    forgiving: true,
  });

  return await createHighlighterCore({
    engine,
    themes: [githubLight, githubDark],
    langs: [
      js,
      ts,
      jsx,
      tsx,
      json,
      html,
      css,
      bash,
      shell,
      python,
      java,
      go,
      markdown,
      yaml,
      xml,
    ],
  });
}

// Shiki 高亮器单例
let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

// 初始化高亮器（懒加载）
async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter() as Promise<Highlighter>;
    highlighter = await highlighterPromise;
  }
  return highlighterPromise;
}

// 同步高亮代码（如果 highlighter 未初始化，返回未高亮的代码）
export function highlightCode(
  code: string,
  language: string | null | undefined
): string {
  if (!highlighter) {
    // 如果还未初始化，尝试初始化（但这是异步的，所以先返回未高亮的代码）
    getHighlighter().catch(console.error);
    return `<pre><code>${code}</code></pre>`;
  }

  const lang = language || "text";
  try {
    return highlighter.codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  } catch (error) {
    console.error("Failed to highlight code:", error);
    return `<pre><code>${code}</code></pre>`;
  }
}
