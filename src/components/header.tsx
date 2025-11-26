import TechButton from "@/components/ui/tech-button";
import { Link, linkOptions } from "@tanstack/react-router";
import { LayoutGrid, Zap } from "lucide-react";

const options = linkOptions([
  {
    to: "/",
    label: "Transmission",
  },
  {
    to: "/",
    label: "Database",
  },
]);

export function Header() {
  return (
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
          {options.map((option) => (
            <Link
              {...option}
              key={option.to}
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
        <div className="md:hidden text-zzz-lime">
          <LayoutGrid size={24} />
        </div>
      </div>

      {/* Decorative bar */}
      <div className="h-0.5 w-full bg-linear-to-r from-zzz-lime via-transparent to-zzz-cyan opacity-50"></div>
    </header>
  );
}
