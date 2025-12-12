import { useTheme, type UserTheme } from "@/components/common/theme-provider";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun, type LucideIcon as Icon } from "lucide-react";

const themeConfig: Record<UserTheme, { icon: Icon; label: string }> = {
  system: { icon: Monitor, label: "System" },
  light: { icon: Sun, label: "Light" },
  dark: { icon: Moon, label: "Dark" },
};

const themes: UserTheme[] = ["system", "light", "dark"];

type ThemeButtonProps = {
  theme: UserTheme;
  onClick: () => void;
};

const buttonClasses: Record<UserTheme, string> = {
  system: "system:bg-gray-300 system:dark:bg-gray-600",
  light: "not-system:light:bg-gray-300 not-system:light:dark:bg-gray-600",
  dark: "not-system:dark:bg-gray-300 not-system:dark:dark:bg-gray-600",
};

const iconClasses: Record<UserTheme, string> = {
  system:
    "system:text-gray-900 system:dark:text-gray-100 text-gray-400 dark:text-gray-500",
  light:
    "not-system:light:text-gray-900 not-system:light:dark:text-gray-100 text-gray-400 dark:text-gray-500",
  dark: "not-system:dark:text-gray-900 not-system:dark:dark:text-gray-100 text-gray-400 dark:text-gray-500",
};

function ThemeButton({ theme, onClick }: ThemeButtonProps) {
  const { icon: Icon, label } = themeConfig[theme];

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center rounded-full p-1.5 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:bg-gray-200/50 dark:hover:bg-gray-700/50",
        buttonClasses[theme]
      )}
    >
      <Icon className={cn("h-4 w-4 transition-colors", iconClasses[theme])} />
    </button>
  );
}

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 p-1 dark:bg-gray-800">
      {themes.map((theme) => (
        <ThemeButton
          key={theme}
          theme={theme}
          onClick={() => setTheme(theme)}
        />
      ))}
    </div>
  );
}
