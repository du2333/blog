import { createContext, useContext, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  // 同步初始化：在客户端立即读取 localStorage，用于 UI 显示
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored === "dark" || stored === "light" || stored === "system") {
        return stored;
      }
    } catch (e) {
      // localStorage 可能不可用
    }
    return defaultTheme;
  });

  // 当用户手动切换主题时，更新 localStorage 和 DOM 类名
  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window === "undefined") return;

      // 更新 localStorage
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);

      // 更新 DOM 类名
      const root = window.document.documentElement;
      let targetTheme: "light" | "dark";

      if (newTheme === "system") {
        targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        targetTheme = newTheme;
      }

      root.classList.remove("light", "dark");
      root.classList.add(targetTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
