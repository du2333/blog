import { Copy, Check } from "lucide-react";
import { useState, memo } from "react";

interface CodeBlockProps {
  html: string;
  language: string | null;
  code: string;
}

// 将代码内容区域分离为独立组件，避免状态更新时重新渲染
const CodeContent = memo(({ html }: { html: string }) => {
  return (
    <div
      className="shiki overflow-x-auto rounded-b-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

CodeContent.displayName = "CodeContent";

export function CodeBlock({ html, language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

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
      <CodeContent html={html} />
    </div>
  );
}
