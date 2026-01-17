import { Check, Copy } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { highlight as highlightCode } from "@/lib/shiki";
import { useTheme } from "@/components/common/theme-provider";

// 全局高亮缓存
const highlightCache = new Map<string, string>();

interface CodeBlockProps {
  code: string;
  language: string | null;
}

export const CodeBlock = memo(({ code, language }: CodeBlockProps) => {
  const { appTheme } = useTheme();
  const cacheKey = `${appTheme}-${language}-${code}`;
  const [html, setHtml] = useState<string>(highlightCache.get(cacheKey) || "");
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!!highlightCache.get(cacheKey));

  useEffect(() => {
    // 即使已经加载，如果主题变了且缓存没命中，也需要重新高亮
    if (html && highlightCache.has(cacheKey)) {
      setHtml(highlightCache.get(cacheKey)!);
      return;
    }

    let mounted = true;

    async function highlight() {
      try {
        const highlighted = await highlightCode(
          code.trim(),
          language || "text",
        );

        if (mounted) {
          highlightCache.set(cacheKey, highlighted);
          setHtml(highlighted);
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Shiki failed to load:", e);
        if (mounted) {
          const fallback = `<pre class="font-mono text-sm whitespace-pre-wrap">${code}</pre>`;
          setHtml(fallback);
          setIsLoaded(true);
        }
      }
    }

    highlight();

    return () => {
      mounted = false;
    };
  }, [code, language, appTheme, cacheKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-12 group relative max-w-full">
      <div className="relative rounded-sm overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-border/40 hover:border-border/60 transition-colors duration-500">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/10 bg-muted/20">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono font-medium text-muted-foreground/60 uppercase tracking-widest">
              {language || "code"}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-[10px] font-mono font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {copied ? (
              <span className="animate-in fade-in slide-in-from-right-1 tracking-widest text-[9px] uppercase opacity-70">
                Copied
              </span>
            ) : null}
            <div className="p-0.5 opacity-60 group-hover/btn:opacity-100 transition-opacity">
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </div>
          </button>
        </div>

        {/* Code Area */}
        <div className="relative p-0 overflow-x-auto custom-scrollbar">
          <div
            className={`p-6 text-sm font-mono leading-relaxed [&>pre]:bg-transparent! transition-opacity duration-700 ${
              !isLoaded ? "opacity-0" : "opacity-100"
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center min-h-20">
              <div className="w-4 h-4 border border-border border-t-foreground/50 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
