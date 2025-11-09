import { Copy, Check } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { initShikiHighlighter, highlightCode } from "@/lib/shiki";

interface CodeBlockProps {
  code: string;
  language: string | null;
}

// 将代码内容区域分离为独立组件，避免状态更新时重新渲染
const CodeContent = memo(
  ({ html, code }: { html: string | null; code: string }) => {
    // SSR 时显示未高亮的代码
    if (!html) {
      return (
        <div className="shiki overflow-x-auto">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // 客户端显示高亮的代码
    return (
      <div
        className="shiki overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

CodeContent.displayName = "CodeContent";

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  // 在客户端初始化 Shiki 并高亮代码
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === "undefined") {
      return;
    }

    let mounted = true;

    async function highlight() {
      try {
        // 初始化 Shiki（如果还没初始化）
        await initShikiHighlighter();

        // 高亮代码
        const html = highlightCode(code, language);

        // 只在组件仍然挂载时更新
        if (mounted) {
          setHighlightedHtml(html);
        }
      } catch (error) {
        console.warn("Failed to highlight code:", error);
        // 如果高亮失败，保持显示未高亮的代码
      }
    }

    highlight();

    return () => {
      mounted = false;
    };
  }, [code, language]);

  const handleCopy = async () => {
    // 确保在客户端环境中执行
    if (typeof window === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const displayLanguage = language || "text";

  return (
    <div className="relative group rounded-lg border border-border overflow-hidden bg-card">
      {/* Header with language indicator and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {displayLanguage}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <CodeContent html={highlightedHtml} code={code} />
    </div>
  );
}
