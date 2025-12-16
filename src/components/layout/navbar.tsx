import { Logo } from "@/components/common/logo";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  Search,
  UserIcon,
} from "lucide-react";

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
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 bg-zzz-black/90 backdrop-blur-md border-b border-zzz-gray h-20">
        {/* Left Section: Brand / Logo */}
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group select-none">
            {/* Logo with Tech Ring Animation */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              {/* Static outer ring */}
              <div className="absolute inset-0 border border-zzz-gray/40 rounded-full"></div>
              {/* Spinning tech ring */}
              <div className="absolute inset-0 border border-t-zzz-lime border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_3s_linear_infinite]"></div>
              {/* Inner Logo */}
              <Logo className="w-5 h-5 text-white group-hover:text-zzz-lime transition-colors relative z-10" />
            </div>

            {/* Angled Divider */}
            <div className="h-8 w-px bg-zzz-gray -skew-x-12 hidden xs:block"></div>

            {/* Text Lockup */}
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-1 leading-none">
                <span className="font-sans font-bold text-xl md:text-2xl text-white tracking-tight group-hover:text-zzz-cyan transition-colors">
                  PROXY
                </span>
                <span className="font-sans font-black text-xl md:text-2xl text-zzz-lime tracking-tighter uppercase">
                  ARCHIVE
                </span>
              </div>
              {/* Micro Metadata */}
              <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-[9px] text-gray-400 tracking-[0.3em] uppercase">
                  Sys_Online
                </span>
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-0.5 bg-zzz-lime rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-zzz-lime rounded-full animate-pulse delay-75"></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Section: Navigation & Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden md:flex items-center gap-8 font-sans font-bold text-sm tracking-widest uppercase">
              {navOptions.map((option) => (
                <Link
                  key={option.id}
                  to={option.to}
                  className="flex items-center h-9 border-b-2 px-1 transition-all duration-300 text-gray-400 border-transparent hover:text-white hover:border-gray-600"
                  activeProps={{
                    className:
                      "text-zzz-lime border-zzz-lime hover:text-zzz-lime hover:border-zzz-lime",
                  }}
                >
                  {option.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Search Trigger */}
            <button
              onClick={onSearchClick}
              className="hidden md:flex group items-center gap-3 px-4 h-9 bg-black border border-zzz-gray hover:border-zzz-lime transition-all duration-300 clip-corner-tr active:scale-95"
              title="Search Database (Ctrl+K)"
            >
              <Search
                size={14}
                className="text-gray-400 group-hover:text-zzz-lime transition-colors"
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-wider transition-colors">
                  检索_DB
                </span>
                <div className="w-px h-3 bg-zzz-gray group-hover:bg-zzz-lime/50 transition-colors"></div>
                <span className="text-[10px] font-mono text-zzz-gray group-hover:text-zzz-lime/80 transition-colors">
                  ⌘K
                </span>
              </div>
            </button>

            {/* Login / Profile Section (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* Admin Link: Only if role is admin */}
                  {user.role === "admin" && (
                    <Link to="/admin">
                      <button
                        className="flex items-center gap-2 px-4 h-10 border border-zzz-gray hover:border-zzz-orange hover:text-zzz-orange transition-all text-[10px] font-bold font-mono uppercase tracking-widest clip-corner-bl group"
                        title="HDD Command Center"
                      >
                        <LayoutDashboard
                          size={14}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="hidden lg:inline">HDD_SYSTEM</span>
                      </button>
                    </Link>
                  )}

                  {/* User Avatar: Opens Profile Modal */}
                  <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-3 group pl-2 text-left"
                    title="Open Profile Card"
                  >
                    <div className="hidden lg:block">
                      <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                        Signal_ID
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-zzz-lime transition-colors uppercase max-w-[100px] truncate">
                        {user.name}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-zzz-dark border border-zzz-gray group-hover:border-zzz-lime flex items-center justify-center relative overflow-hidden clip-corner-br transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] p-0.5">
                      {/* User Avatar or Default Icon */}
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-full h-full object-cover bg-black"
                        />
                      ) : (
                        <div className="w-full h-full bg-zzz-gray/10 flex items-center justify-center group-hover:bg-zzz-lime/10 transition-colors">
                          <UserIcon
                            size={20}
                            className="text-gray-500 group-hover:text-zzz-lime transition-colors"
                          />
                        </div>
                      )}

                      {/* Online Status Dot */}
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zzz-lime rounded-full shadow-[0_0_5px_#ccff00] animate-pulse ring-1 ring-black"></div>
                      {/* Scanline effect */}
                      <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                    </div>
                  </button>
                </>
              ) : (
                <Link to="/login" search={{ redirectTo: location.pathname }}>
                  <button className="flex items-center gap-2 px-4 h-9 border border-zzz-gray hover:bg-zzz-lime hover:text-black hover:border-zzz-lime transition-all text-[10px] font-bold font-mono uppercase tracking-widest clip-corner-br group">
                    <LogIn
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                    <span>连接绳网</span>
                  </button>
                </Link>
              )}
            </div>
            {/* Mobile Search Trigger - Square Design */}
            <button
              onClick={onSearchClick}
              className="md:hidden w-10 h-10 flex items-center justify-center border border-zzz-gray bg-black text-gray-400 hover:text-zzz-lime hover:border-zzz-lime transition-all clip-corner-bl active:scale-95"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Mobile Menu Trigger */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-zzz-lime bg-zzz-dark border border-transparent hover:bg-zzz-lime hover:text-black transition-colors clip-corner-tr group active:scale-95"
              onClick={onMenuClick}
              aria-label="Menu"
            >
              <LayoutGrid
                size={24}
                className="group-active:scale-90 transition-transform"
              />
            </button>
          </div>
        </div>
        <div className="h-0.5 w-full bg-linear-to-r from-zzz-lime via-transparent to-zzz-cyan opacity-50"></div>
      </header>
    </>
  );
}
