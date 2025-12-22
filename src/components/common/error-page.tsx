import { useRouter } from "@tanstack/react-router";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorPage({ error }: { error: Error }) {
	const router = useRouter();
	const onReset = () => {
		router.invalidate();
	};
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 md:p-8 transition-[background-color] duration-500">
			<div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
				<div className="space-y-4">
					<div className="w-16 h-16 bg-red-50 dark:bg-red-950/10 rounded-full flex items-center justify-center mx-auto border border-red-100 dark:border-red-900">
						<AlertCircle size={32} className="text-red-500" />
					</div>

					<div className="space-y-2">
						<h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
							程序发生错误
						</h2>
						<p className="text-muted-foreground font-light leading-relaxed max-w-md mx-auto text-sm md:text-base">
							执行过程中遇到了意外情况，您可以尝试刷新或重试。
						</p>
					</div>
				</div>

				{/* Error Details */}
				{error && (
					<div className="w-full bg-muted/50 border border-border p-4 md:p-6 text-left relative group overflow-hidden rounded-sm">
						<pre className="font-mono text-[10px] md:text-xs text-muted-foreground whitespace-pre-wrap break-all custom-scrollbar max-h-[30vh] overflow-y-auto leading-relaxed">
							{error.toString()}
							{error.stack && `\n\n${error.stack}`}
						</pre>
					</div>
				)}

				<button
					onClick={onReset}
					className="group inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] font-medium transition-all"
				>
					<div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
						<RefreshCw
							size={18}
							className="group-hover:rotate-180 transition-transform duration-700"
						/>
					</div>
					<span className="border-b border-transparent group-hover:border-current transition-all">
						重试并恢复
					</span>
				</button>
			</div>
		</div>
	);
}
