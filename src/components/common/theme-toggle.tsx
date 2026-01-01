import { Monitor, Moon, Sun } from "lucide-react";
import type { UserTheme } from "@/components/common/theme-provider";
import { useTheme } from "@/components/common/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes: Array<UserTheme> = ["light", "dark", "system"];

export function ThemeToggle({ className }: { className?: string }) {
	const { userTheme, setTheme } = useTheme();

	const getNextTheme = () => {
		const currentIndex = themes.indexOf(userTheme);
		const nextIndex = (currentIndex + 1) % themes.length;
		return themes[nextIndex];
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(getNextTheme())}
			className={cn("h-10 w-10 bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground transition-all duration-500", className)}
			title={`Theme: ${userTheme}`}
		>
			<div className="relative flex items-center justify-center w-full h-full">
				{/* Light Mode Icon - Shown only when exactly light */}
				<span className="hidden [.light:not(.system)_&]:block animate-in fade-in zoom-in duration-500">
					<Sun size={16} strokeWidth={1.2} />
				</span>

				{/* Dark Mode Icon - Shown only when exactly dark */}
				<span className="hidden [.dark:not(.system)_&]:block animate-in fade-in zoom-in duration-500">
					<Moon size={16} strokeWidth={1.2} />
				</span>

				{/* System Mode Icon - Shown only when system is active */}
				<span className="hidden in-[.system]:block animate-in fade-in zoom-in duration-500">
					<Monitor size={16} strokeWidth={1.2} />
				</span>
			</div>
		</Button>
	);
}
