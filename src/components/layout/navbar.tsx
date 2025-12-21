import { Logo } from "@/components/common/logo";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogIn,
  Moon,
  Search,
  Sun,
  UserIcon,
} from "lucide-react";
import { useTheme } from "@/components/common/theme-provider";

interface NavbarProps {
  navOptions: {
    label: string;
    to: string;
    id: string;
    color: string;
  }[];
  onSearchClick: () => void;
  onMenuClick: () => void;
  onOpenProfile: () => void;
  user?: {
    name: string;
    image?: string | null;
    role?: string | null;
  };
}

export function Navbar({
  onSearchClick,
  onMenuClick,
  user,
  navOptions,
  onOpenProfile,
}: NavbarProps) {
  const { appTheme, setTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 h-20 transition-colors duration-500">
        <div className="container mx-auto px-6 md:px-10 h-full flex items-center justify-between">
          {/* Left: Brand */}
          <Link to="/" className="flex items-center gap-6 group select-none">
            <div className="relative flex items-center justify-center">
              <Logo className="w-6 h-6 text-zinc-900 dark:text-zinc-100 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="flex flex-col">
              <span className="font-serif italic text-lg leading-none tracking-tight text-zinc-900 dark:text-zinc-100">
                编年史
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-1 text-zinc-500 dark:text-zinc-400">
                New Eridu
              </span>
            </div>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-8 md:gap-12">
            <nav className="hidden md:flex items-center gap-10 font-sans text-[11px] font-medium tracking-[0.2em] uppercase">
              {navOptions.map((option) => (
                <Link
                  key={option.id}
                  to={option.to}
                  className="transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 relative group"
                  activeProps={{
                    className: "text-zinc-900 dark:text-zinc-100",
                  }}
                >
                  {option.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-500 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 md:gap-6">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(appTheme === "dark" ? "light" : "dark")}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                title="切换主题"
              >
                {appTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Search */}
              <button
                onClick={onSearchClick}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Search (⌘K)"
              >
                <Search size={18} />
              </button>

              {/* Profile/Login */}
              <div className="hidden md:block">
                {user ? (
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5 transition-transform group-hover:scale-105">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={18} className="opacity-50" />
                      )}
                    </div>
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="text-[10px] font-medium uppercase tracking-widest px-6 py-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500">
                      登录
                    </button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu */}
              <button
                className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                onClick={onMenuClick}
              >
                <div className="w-5 h-px bg-current mb-1.5"></div>
                <div className="w-5 h-px bg-current"></div>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
