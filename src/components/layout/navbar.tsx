import { Logo } from "@/components/common/logo";
import TechButton from "@/components/ui/tech-button";
import { Link } from "@tanstack/react-router";
import {
  Disc,
  LayoutGrid,
  Search,
  X,
  LogIn,
  LogOut,
  UserIcon,
} from "lucide-react";

const navOptions = [
  { label: "Transmission", to: "/", id: "transmission", color: "zzz-lime" },
  { label: "Database", to: "/database", id: "database", color: "zzz-lime" },
];

export function Navbar({
  onSearchClick,
  onMenuClick,
  user,
  logout,
}: {
  onSearchClick: () => void;
  onMenuClick: () => void;
  user?: {
    name: string;
    image?: string | null;
  };
  logout: () => Promise<void>;
}) {
  return (
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
            className="hidden md:flex group items-center gap-3 px-4 h-9 bg-black border border-zzz-gray hover:border-zzz-lime transition-all duration-300 clip-corner-tr active:scale-95 cursor-pointer"
            title="Search Database (Ctrl+K)"
          >
            <Search
              size={14}
              className="text-gray-400 group-hover:text-zzz-lime transition-colors"
            />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-wider transition-colors">
                Search_DB
              </span>
              <div className="w-px h-3 bg-zzz-gray group-hover:bg-zzz-lime/50 transition-colors"></div>
              <span className="text-[10px] font-mono text-zzz-gray group-hover:text-zzz-lime/80 transition-colors">
                ⌘K
              </span>
            </div>
          </button>

          {/* Login / Profile Button (Desktop & Tablet) */}
          <div className="hidden md:block">
            {user ? (
              <Link
                to="/admin"
                className="flex items-center gap-3 group pl-2"
                title="Access HDD System"
              >
                <div className="text-right hidden lg:block">
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    Signal_ID
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-zzz-lime transition-colors uppercase max-w-[100px] truncate">
                    {user.name}
                  </div>
                </div>
                <div className="w-10 h-10 bg-zzz-dark border border-zzz-gray group-hover:border-zzz-lime flex items-center justify-center relative overflow-hidden clip-corner-br transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] p-0.5">
                  {/* User image or Default Icon */}
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
              </Link>
            ) : (
              <Link to="/login">
                <button className="flex items-center gap-2 px-4 h-9 border border-zzz-gray hover:bg-zzz-lime hover:text-black hover:border-zzz-lime transition-all text-[10px] font-bold font-mono uppercase tracking-widest clip-corner-br group cursor-pointer">
                  <LogIn
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                  <span>Connect</span>
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
  );
}

export function MobileMenu({
  isOpen,
  onClose,
  user,
  logout,
}: {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    image?: string | null;
  };
  logout: () => Promise<void>;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none delay-200"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />
      <div
        className={`
              absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-zzz-dark border-l-2 border-zzz-lime 
              flex flex-col shadow-[-20px_0_50px_rgba(204,255,0,0.1)]
              transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1)
              ${isOpen ? "translate-x-0" : "translate-x-full"}
          `}
      >
        <div className="flex items-center justify-between p-6 border-b border-zzz-gray bg-zzz-black relative overflow-hidden shrink-0 h-20">
          <div
            className={`absolute inset-0 bg-zzz-lime transition-transform duration-700 ease-out ${
              isOpen
                ? "translate-x-full opacity-0 delay-100"
                : "-translate-x-full opacity-50"
            }`}
          ></div>
          <span className="font-mono text-zzz-lime text-xs tracking-[0.2em] uppercase relative z-10 flex items-center gap-2">
            <div
              className={`w-2 h-2 bg-zzz-lime rounded-full ${
                isOpen ? "animate-pulse" : ""
              }`}
            ></div>
            System_Nav
          </span>
          <button
            onClick={onClose}
            className="text-white hover:text-black p-2 relative z-10 group overflow-hidden border border-transparent hover:border-zzz-lime transition-all"
          >
            <div className="absolute inset-0 bg-zzz-lime translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
            <X size={24} className="relative z-10" />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center px-10 gap-10 bg-[radial-gradient(circle_at_top_right,#1a1a1a_0%,transparent_40%)] overflow-y-auto relative z-10">
          {navOptions.map((item, idx) => (
            <Link
              key={item.id}
              to={item.to}
              onClick={onClose}
              className={`
                              text-4xl font-black font-sans uppercase text-white text-left flex items-center gap-6 group transition-all duration-300
                              ${
                                isOpen
                                  ? "translate-x-0 opacity-100"
                                  : "translate-x-10 opacity-0"
                              }
                          `}
              style={{ transitionDelay: `${150 + idx * 100}ms` }}
            >
              <span
                className={`w-1 h-1 bg-${item.color} group-hover:h-8 group-hover:w-2 transition-all duration-300`}
              ></span>
              <span
                className={`group-hover:text-${item.color} transition-colors`}
              >
                {item.label}
              </span>
            </Link>
          ))}

          {/* Mobile specific admin link if logged in */}
          {user && (
            <Link
              to="/admin"
              onClick={onClose}
              className={`
                              text-4xl font-black font-sans uppercase text-white text-left flex items-center gap-6 group transition-all duration-300
                              ${
                                isOpen
                                  ? "translate-x-0 opacity-100"
                                  : "translate-x-10 opacity-0"
                              }
                          `}
              style={{ transitionDelay: "350ms" }}
            >
              <span className="w-1 h-1 bg-zzz-cyan group-hover:h-8 group-hover:w-2 transition-all duration-300"></span>
              <span className="group-hover:text-zzz-cyan transition-colors">
                HDD_SYSTEM
              </span>
            </Link>
          )}
        </div>

        <div className="absolute bottom-32 -left-16 text-zzz-gray/5 pointer-events-none z-0">
          <Disc size={300} className="animate-[spin_10s_linear_infinite]" />
        </div>

        <div className="p-8 border-t border-zzz-gray bg-zzz-black relative shrink-0 z-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-stripe-pattern opacity-20"></div>
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* image */}
                <div className="w-10 h-10 border border-zzz-lime p-0.5 bg-zzz-dark shrink-0 clip-corner-tl flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover bg-black"
                    />
                  ) : (
                    <UserIcon size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-gray-500 truncate">
                    PROXY_ID: {user.name}
                  </div>
                  <div className="text-[10px] font-mono text-zzz-lime flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-zzz-lime rounded-full animate-pulse"></div>
                    ONLINE
                  </div>
                </div>
              </div>
              <TechButton
                className="w-full justify-center"
                onClick={() => {
                  logout();
                  onClose();
                }}
                icon={<LogOut size={16} />}
              >
                TERMINATE_SESSION
              </TechButton>
            </div>
          ) : (
            <Link to="/login" onClick={onClose}>
              <TechButton
                className="w-full justify-center"
                variant="primary"
                icon={<LogIn size={16} />}
              >
                ESTABLISH_CONNECTION
              </TechButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
