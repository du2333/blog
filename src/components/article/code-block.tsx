import { Check, Copy } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { useTheme } from "@/components/common/theme-provider";

// 全局高亮缓存
const highlightCache = new Map<string, string>();

interface CodeBlockProps {
	code: string;
	language: string | null;
}

export const CodeBlock = memo(function CodeBlock({
	code,
	language,
}: CodeBlockProps) {
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
				const highlighted = await codeToHtml(code.trim(), {
					lang: language || "text",
					themes: {
						dark: "vitesse-dark",
						light: "vitesse-light",
					},
				});

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
		<div className="my-16 group relative max-w-full">
			<div className="relative rounded-sm overflow-hidden bg-muted/50 transition-all duration-700 border border-border group-hover:border-border">
				{/* Minimal Header */}
				<div className="flex items-center justify-between px-6 py-3 select-none">
					<div className="flex items-center gap-4">
						<span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-[0.4em]">
							{language || "Source"}
						</span>
					</div>

					<button
						onClick={handleCopy}
						className="flex items-center gap-2 text-[10px] font-mono font-medium text-muted-foreground hover:text-foreground transition-all duration-500"
					>
						{copied ? (
							<span className="animate-in fade-in slide-in-from-right-2 tracking-widest">
								已复制
							</span>
						) : (
							<span className="opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
								Copy
							</span>
						)}
						<div className="p-1 rounded-full transition-colors">
							{copied ? <Check size={12} /> : <Copy size={12} />}
						</div>
					</button>
				</div>

				{/* Code Area */}
				<div className="relative p-0 overflow-x-auto custom-scrollbar">
					<div
						className={`p-8 pt-4 text-sm md:text-base font-mono leading-relaxed [&>pre]:bg-transparent! transition-opacity duration-1000 ${
							!isLoaded ? "opacity-0" : "opacity-100"
						}`}
					>
						<div dangerouslySetInnerHTML={{ __html: html }} />
					</div>

					{!isLoaded && (
						<div className="absolute inset-0 flex items-center justify-center bg-muted min-h-[100px]">
							<div className="flex flex-col items-center gap-3">
								<div className="w-4 h-4 border border-border border-t-foreground rounded-full animate-spin"></div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});
