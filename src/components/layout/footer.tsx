export function Footer() {
  return (
    <footer className="border-t border-zzz-gray bg-zzz-dark py-8 mt-12 relative overflow-hidden z-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-mono text-xs text-gray-500">
          © {new Date().getFullYear()} PROXY ARCHIVE. ALL RIGHTS RESERVED.
          <br />
          SYSTEM STATUS: STABLE
        </div>
        <div className="flex gap-4">
          <div className="w-2 h-2 bg-zzz-lime rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-zzz-orange rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-zzz-cyan rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
      {/* Big muted text background */}
      <div className="absolute -bottom-10 right-0 text-[10rem] font-black text-white/5 pointer-events-none select-none leading-none">
        ZZZ
      </div>
    </footer>
  );
}
