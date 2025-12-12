import { Logo } from "@/components/logo";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 bg-stripe-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)] pointer-events-none"></div>

      {/* Animated Background Rings (The 'Hollow' Entrance feel) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-zzz-gray/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-zzz-gray/20 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>

      {/* --- Main Content Container --- */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Common Header Logo (Shared across all auth pages) */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-zzz-lime blur-xl opacity-20 animate-pulse"></div>
            <Logo className="w-16 h-16 text-zzz-lime mx-auto relative z-10" />
          </div>
        </div>

        {/* Page Content Injection */}
        <Outlet />

        {/* Footer / Legal / Version */}
        <div className="mt-8 text-center opacity-30">
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
            Proxy Network V.3.0 // New Eridu
          </p>
        </div>
      </div>
    </div>
  );
}
