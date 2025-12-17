import { Logo } from "@/components/common/logo";
import {
  emailVerficationRequiredQuery,
  sessionQuery,
} from "@/features/auth/auth.query";
import { CACHE_CONTROL } from "@/lib/cache/cache-control";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery);
    const isEmailVerficationRequired =
      await context.queryClient.ensureQueryData(emailVerficationRequiredQuery);

    if (session && !location.pathname.includes("verify-email")) {
      throw redirect({ to: "/" });
    }

    return { session, isEmailVerficationRequired };
  },
  component: RouteComponent,
  headers: () => {
    return CACHE_CONTROL.private;
  },
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* --- Return Home Button --- */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-3 text-gray-500 hover:text-zzz-lime transition-colors group"
      >
        <div className="w-10 h-10 border border-zzz-gray group-hover:border-zzz-lime flex items-center justify-center bg-black transition-colors clip-corner-tl shadow-lg">
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </div>
        <div className=" flex-col items-start hidden sm:flex">
          <span className="font-sans font-bold text-sm uppercase leading-none text-white group-hover:text-zzz-lime transition-colors">
            终止连接
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
            Return_Signal
          </span>
        </div>
      </Link>

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
