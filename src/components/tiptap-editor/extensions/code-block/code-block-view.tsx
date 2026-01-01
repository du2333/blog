import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { LANGUAGES } from "./languages";
import type { NodeViewProps } from "@tiptap/react";
import DropdownMenu from "@/components/ui/dropdown-menu";

export function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		const code = node.textContent;
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const language = node.attrs.language || "text";

	return (
		<NodeViewWrapper className="my-16 relative group">
			<div className="overflow-hidden bg-muted transition-all duration-700 border border-border group-hover:border-border">
				{/* Simple Header */}
				<div className="flex items-center justify-between px-6 py-3 select-none bg-muted/50 border-b border-border/50">
					<div className="flex items-center gap-3">
						<DropdownMenu
							value={language}
							onChange={val => updateAttributes({ language: val })}
							options={LANGUAGES.map(lang => ({
								label: lang.label,
								value: lang.value,
							}))}
						/>
					</div>

					<button
						onClick={handleCopy}
						contentEditable={false}
						className="flex items-center gap-2 text-[10px] font-mono font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
					>
						{copied
							? (
									<span className="animate-in fade-in slide-in-from-right-2">
										已复制
									</span>
								)
							: (
									<span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
										Copy
									</span>
								)}
						{copied ? <Check size={12} /> : <Copy size={12} />}
					</button>
				</div>

				{/* Code Area */}
				<NodeViewContent
					as="div"
					className="relative p-8 pt-4 overflow-x-auto custom-scrollbar text-sm md:text-base font-mono leading-relaxed outline-none text-muted-foreground"
					spellCheck={false}
				/>
			</div>
		</NodeViewWrapper>
	);
}
