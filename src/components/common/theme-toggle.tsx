import { Monitor, Moon, Sun } from "lucide-react";
import type { UserTheme } from "@/components/common/theme-provider";
import { useTheme } from "@/components/common/theme-provider";
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
    <button
      onClick={() => setTheme(getNextTheme())}
      className={cn(
        "p-2 text-muted-foreground hover:text-foreground transition-colors duration-300",
        className,
      )}
      title={`Theme: ${userTheme}`}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        {/* Light Mode Icon */}
        <span className="hidden [.light:not(.system)_&]:block">
          <Sun size={14} strokeWidth={1.5} />
        </span>

        {/* Dark Mode Icon */}
        <span className="hidden [.dark:not(.system)_&]:block">
          <Moon size={14} strokeWidth={1.5} />
        </span>

        {/* System Mode Icon */}
        <span className="hidden in-[.system]:block">
          <Monitor size={14} strokeWidth={1.5} />
        </span>
      </div>
    </button>
  );
}
