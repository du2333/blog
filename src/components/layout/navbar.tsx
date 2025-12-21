import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Moon, Search, Sun, UserIcon } from "lucide-react";
import { useTheme } from "@/components/common/theme-provider";
import { useEffect, useState } from "react";

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
  isLoading?: boolean;
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
  isLoading,
}: NavbarProps) {
  const { appTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-24 flex items-center transition-[height,background-color,border-color] duration-700 ${
          isScrolled
            ? "bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 h-20"
            : "bg-transparent border-b border-transparent h-24"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Left: Brand */}
          <Link to="/" className="group select-none">
            <div className="w-8 h-8 text-zinc-900 dark:text-zinc-100">
              <div className="w-full h-full border-[1.5px] border-current rounded-full flex items-center justify-center p-[20%]">
                <div className="w-full h-full bg-current rounded-full"></div>
              </div>
            </div>
          </Link>

          {/* Center: Main Nav (Absolute center for true minimalist feel) */}
          <nav className="hidden lg:flex items-center gap-12">
            {navOptions.map((option) => (
              <Link
                key={option.id}
                to={option.to}
                className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors py-2"
                activeProps={{
                  className: "text-zinc-900 dark:text-zinc-100",
                }}
              >
                {option.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(appTheme === "dark" ? "light" : "dark")}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Theme"
              >
                {appTheme === "dark" ? (
                  <Sun size={16} strokeWidth={1.2} />
                ) : (
                  <Moon size={16} strokeWidth={1.2} />
                )}
              </button>
              <button
                onClick={onSearchClick}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Search"
              >
                <Search size={16} strokeWidth={1.2} />
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

            {/* Profile / Menu Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ) : (
                  <div className="flex items-center gap-4 animate-in fade-in duration-700">
                    {user ? (
                      <>
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all duration-500 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            title="进入后台"
                          >
                            <LayoutDashboard size={18} strokeWidth={1.5} />
                          </Link>
                        )}
                        <button
                          onClick={onOpenProfile}
                          className="group flex items-center p-0.5 rounded-full border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-500"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                                <UserIcon
                                  size={14}
                                  className="text-zinc-300"
                                  strokeWidth={1}
                                />
                              </div>
                            )}
                          </div>
                        </button>
                      </>
                    ) : (
                      <Link to="/login">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                          Login
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <button
                className="w-10 h-10 flex flex-col items-center justify-center gap-1 group"
                onClick={onMenuClick}
              >
                <div className="w-6 h-[1px] bg-zinc-900 dark:bg-zinc-100 transition-transform group-hover:scale-x-75 origin-right"></div>
                <div className="w-6 h-[1px] bg-zinc-900 dark:bg-zinc-100 transition-transform group-hover:scale-x-110 origin-right"></div>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to push content down since header is fixed */}
      <div className="h-24"></div>
    </>
  );
}
