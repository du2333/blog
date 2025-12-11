import { Logo } from "@/components/logo";
import TechButton from "@/components/ui/tech-button";
import { Link } from "@tanstack/react-router";
import { Disc, LayoutGrid, Search, X } from "lucide-react";

const navOptions = [
  { label: "Transmission", to: "/", id: "transmission", color: "zzz-lime" },
  { label: "Database", to: "/database", id: "database", color: "zzz-lime" },
];

export function Navbar({
  onSearchClick,
  onMenuClick,
}: {
  onSearchClick: () => void;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-zzz-black/90 backdrop-blur-md border-b border-zzz-gray h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-zzz-lime flex items-center justify-center clip-corner-bl group-hover:bg-white transition-colors">
            <Logo className="w-6 h-6 text-black fill-current" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans font-bold text-2xl leading-none tracking-tighter uppercase italic">
              PROXY<span className="text-zzz-lime">ARCHIVE</span>
            </h1>
            <span className="font-mono text-[10px] text-gray-500 tracking-widest">
              VER 2.5 // ONLINE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-8">
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
}: {
  isOpen: boolean;
  onClose: () => void;
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
        <div className="flex-1 flex flex-col justify-center px-10 gap-10 bg-[radial-gradient(circle_at_top_right,#1a1a1a_0%,transparent_40%)] overflow-y-auto">
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
        </div>
        <div className="absolute bottom-32 -left-16 text-zzz-gray/5 pointer-events-none">
          <Disc size={300} className="animate-[spin_10s_linear_infinite]" />
        </div>
        <div className="p-8 border-t border-zzz-gray bg-zzz-black relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-stripe-pattern opacity-20"></div>
          <TechButton className="w-full justify-center" onClick={onClose}>
            TERMINATE_SESSION
          </TechButton>
        </div>
      </div>
    </div>
  );
}
