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
import type { Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki";
import { createHighlighterCore } from "shiki/core";

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

// 初始化高亮器
export async function initShikiHighlighter(): Promise<void> {
  if (highlighter) {
    return;
  }
  highlighter = (await createHighlighter()) as Highlighter;
}

// 获取高亮器实例
export function getHighlighter(): Highlighter {
  if (!highlighter) {
    throw new Error(
      "Shiki highlighter not initialized. Call initShikiHighlighter() first."
    );
  }
  return highlighter;
}

// 同步高亮代码
export function highlightCode(
  code: string,
  language: string | null | undefined
): string {
  try {
    const highlighterInstance = getHighlighter();
    const lang = language || "text";

    // Shiki 会自动转义 HTML 标签，但为了确保安全，我们使用 codeToHtml
    // 它会生成完整的、正确转义的 HTML
    const html = highlighterInstance.codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });

    // 确保返回的 HTML 是完整的，没有被截断
    return html;
  } catch (error) {
    // 如果高亮器未初始化或高亮失败，返回转义的代码
    console.warn("Failed to highlight code");
    return `<pre><code>${code}</code></pre>`;
  }
}
