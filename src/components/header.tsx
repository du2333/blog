import TechButton from "@/components/ui/tech-button";
import { Link } from "@tanstack/react-router";
import { Disc, LayoutGrid, X, Zap } from "lucide-react";
import { useState } from "react";

const navOptions = [
  { label: "Archive", to: "/", id: "archive", color: "zzz-lime" },
  { label: "Database", to: "/db", id: "database", color: "zzz-lime" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* --- Mobile Menu Overlay --- */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none delay-200"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`
            absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-zzz-dark border-l-2 border-zzz-lime 
            flex flex-col shadow-[-20px_0_50px_rgba(204,255,0,0.1)]
            transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1)
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-zzz-gray bg-zzz-black relative overflow-hidden shrink-0 h-20">
            {/* Flash Effect on Open */}
            <div
              className={`absolute inset-0 bg-zzz-lime transition-transform duration-700 ease-out ${
                isMenuOpen
                  ? "translate-x-full opacity-0 delay-100"
                  : "-translate-x-full opacity-50"
              }`}
            ></div>

            <span className="font-mono text-zzz-lime text-xs tracking-[0.2em] uppercase relative z-10 flex items-center gap-2">
              <div
                className={`w-2 h-2 bg-zzz-lime rounded-full ${
                  isMenuOpen ? "animate-pulse" : ""
                }`}
              ></div>
              System_Nav
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-black p-2 relative z-10 group overflow-hidden border border-transparent hover:border-zzz-lime transition-all"
            >
              <div className="absolute inset-0 bg-zzz-lime translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
              <X size={24} className="relative z-10" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 flex flex-col justify-center px-10 gap-10 bg-[radial-gradient(circle_at_top_right,#1a1a1a_0%,transparent_40%)] overflow-y-auto">
            {navOptions.map((item, idx) => (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  text-4xl font-black font-sans uppercase text-white text-left flex items-center gap-6 group transition-all duration-300
                  ${
                    isMenuOpen
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

          {/* Decorative Background Icon */}
          <div className="absolute bottom-32 -left-16 text-zzz-gray/5 pointer-events-none">
            <Disc size={300} className="animate-[spin_10s_linear_infinite]" />
          </div>

          {/* Footer Action */}
          <div className="p-8 border-t border-zzz-gray bg-zzz-black relative shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-stripe-pattern opacity-20"></div>
            <TechButton
              className="w-full justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              TERMINATE_SESSION
            </TechButton>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-zzz-black/90 backdrop-blur-md border-b border-zzz-gray h-20">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-zzz-lime flex items-center justify-center clip-corner-bl group-hover:bg-white transition-colors">
              <Zap className="text-black fill-current" size={24} />
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

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 font-sans font-bold text-lg tracking-wide uppercase">
            {navOptions.map((option) => (
              <Link
                key={option.id}
                to={option.to}
                className="hover:text-zzz-lime transition-colors border-b-2 text-gray-400 border-transparent"
                activeProps={{
                  className: "text-zzz-lime border-zzz-lime",
                }}
              >
                {option.label}
              </Link>
            ))}

            <TechButton variant="primary" className="ml-4 text-sm">
              Connect
            </TechButton>
          </nav>

          {/* Mobile Menu Icon */}
          <button
            className="md:hidden text-zzz-lime hover:bg-zzz-lime hover:text-black p-2 transition-colors border border-transparent hover:border-zzz-lime clip-corner-tr group"
            onClick={() => setIsMenuOpen(true)}
          >
            <LayoutGrid
              size={24}
              className="group-active:scale-90 transition-transform"
            />
          </button>
        </div>

        {/* Decorative bar */}
        <div className="h-0.5 w-full bg-linear-to-r from-zzz-lime via-transparent to-zzz-cyan opacity-50"></div>
      </header>
    </>
  );
}
