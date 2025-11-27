import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string | null;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function highlight() {
      try {
        const highlighted = await codeToHtml(code.trim(), {
          lang: language || "text",
          theme: "andromeeda",
        });

        if (mounted) {
          setHtml(highlighted);
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Shiki failed to load:", e);
        // Fallback to plain text
        if (mounted) {
          setHtml(
            `<pre class="text-gray-300 font-mono text-sm whitespace-pre-wrap">${code}</pre>`
          );
          setIsLoaded(true);
        }
      }
    }

    highlight();

    return () => {
      mounted = false;
    };
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 relative group border-2 border-zzz-gray bg-zzz-black overflow-hidden rounded-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zzz-dark border-b border-zzz-gray select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zzz-gray group-hover:bg-zzz-lime transition-colors"></div>
          <span className="text-zzz-lime font-mono text-xs font-bold uppercase tracking-wider">
            {language || "PLAINTEXT"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <span className="text-zzz-lime">COPIED</span>
              <Check size={14} className="text-zzz-lime" />
            </>
          ) : (
            <>
              <span>COPY_DATA</span>
              <Copy size={14} />
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="relative p-0 overflow-x-auto custom-scrollbar bg-[#1a1b1e]">
        {!isLoaded ? (
          <div className="p-6 text-gray-500 font-mono text-sm animate-pulse">
            INITIALIZING_HIGHLIGHTER...
          </div>
        ) : (
          <div
            className="p-6 text-sm font-mono leading-relaxed [&>pre]:bg-transparent!"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      {/* Decorative Bottom Line */}
      <div className="h-1 w-full bg-zzz-lime scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
}
