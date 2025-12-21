import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { LANGUAGES } from "./languages";

export function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = node.textContent;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: e.target.value });
  };

  const language = node.attrs.language || "text";

  return (
    <NodeViewWrapper className="my-16 relative group">
      <div className="rounded-sm overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/20 transition-all duration-700 border border-zinc-100 dark:border-zinc-900 group-hover:border-zinc-200 dark:group-hover:border-zinc-800">
        {/* Simple Header */}
        <div className="flex items-center justify-between px-6 py-3 select-none">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={handleLanguageChange}
              contentEditable={false}
              className="appearance-none bg-transparent font-mono text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em] border-none outline-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option
                  key={lang.value}
                  value={lang.value}
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCopy}
            contentEditable={false}
            className="flex items-center gap-2 text-[10px] font-mono font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-300"
          >
            {copied ? (
              <span className="animate-in fade-in slide-in-from-right-2 text-zinc-900 dark:text-zinc-100">已复制</span>
            ) : (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Copy</span>
            )}
            {copied ? <Check size={12} className="text-zinc-900 dark:text-zinc-100" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Code Area */}
        <NodeViewContent
          as="div"
          className="relative p-8 pt-4 overflow-x-auto custom-scrollbar text-sm md:text-base font-mono leading-relaxed outline-none"
          spellCheck={false}
        />
      </div>
    </NodeViewWrapper>
  );
}
