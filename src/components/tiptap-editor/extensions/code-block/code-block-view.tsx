import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { LANGUAGES } from "./languages";
import DropdownMenu from "@/components/ui/dropdown-menu";

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
      <div className="rounded-sm overflow-hidden bg-zinc-950 dark:bg-zinc-900/20 transition-all duration-700 border border-zinc-900 dark:border-zinc-800 group-hover:border-zinc-800 dark:group-hover:border-zinc-700">
        {/* Simple Header */}
        <div className="flex items-center justify-between px-6 py-3 select-none bg-zinc-900/50 dark:bg-zinc-900/30 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <DropdownMenu
              value={language}
              onChange={(val) => updateAttributes({ language: val })}
              options={LANGUAGES.map((lang) => ({
                label: lang.label,
                value: lang.value,
              }))}
            />
          </div>

          <button
            onClick={handleCopy}
            contentEditable={false}
            className="flex items-center gap-2 text-[10px] font-mono font-medium text-zinc-500 hover:text-zinc-100 transition-all duration-300"
          >
            {copied ? (
              <span className="animate-in fade-in slide-in-from-right-2 text-zinc-100">已复制</span>
            ) : (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Copy</span>
            )}
            {copied ? <Check size={12} className="text-zinc-100" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Code Area */}
        <NodeViewContent
          as="div"
          className="relative p-8 pt-4 overflow-x-auto custom-scrollbar text-sm md:text-base font-mono leading-relaxed outline-none text-zinc-200 dark:text-zinc-300"
          spellCheck={false}
        />
      </div>
    </NodeViewWrapper>
  );
}
