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
    <NodeViewWrapper className="my-8 relative group">
      <div className="border-2 border-zzz-gray bg-zzz-black overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zzz-dark border-b border-zzz-gray select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zzz-gray group-hover:bg-zzz-lime transition-colors"></div>
            <select
              value={language}
              onChange={handleLanguageChange}
              contentEditable={false}
              className="text-zzz-lime bg-transparent font-mono text-xs font-bold uppercase tracking-wider border-none outline-none cursor-pointer hover:text-white transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option
                  key={lang.value}
                  value={lang.value}
                  className="bg-zzz-dark text-zzz-lime"
                >
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCopy}
            contentEditable={false}
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
        <NodeViewContent
          as="div"
          className="relative p-6 overflow-x-auto custom-scrollbar bg-[#1a1b1e] text-sm font-mono leading-relaxed text-gray-300 outline-none"
          spellCheck={false}
        />

        {/* Decorative Bottom Line */}
        <div className="h-1 w-full bg-zzz-lime scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </NodeViewWrapper>
  );
}
