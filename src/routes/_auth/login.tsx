import { LoginForm } from "@/components/auth/login-form";
import { SocialLogin } from "@/components/auth/social-login";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    redirectTo: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectTo } = Route.useSearch();

  return (
    <>
      {/* Page Specific Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic tracking-tighter">
          Inter-Knot{" "}
          <span className="text-zzz-lime drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">
            Login
          </span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-2 tracking-[0.2em] uppercase">
          SECURE GATEWAY // HDD SYSTEM
        </p>
      </div>

      {/* Card Content */}
      <div className="bg-zzz-black border-2 border-zzz-gray shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative clip-corner-tr">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-16 h-1 bg-zzz-lime"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zzz-gray"></div>

        <LoginForm redirectTo={redirectTo} />

        <div className="mt-8">
          <SocialLogin redirectTo={redirectTo} />
        </div>

        <div className="mt-6 text-center pt-6 border-t border-zzz-gray/30">
          <span className="text-[10px] font-mono text-gray-600 uppercase">
           新代理人?{" "}
          </span>
          <Link
            to="/register"
            className="text-[10px] font-mono font-bold text-zzz-lime hover:underline uppercase tracking-wider ml-2"
          >
            初始化账户
          </Link>
        </div>
      </div>
    </>
  );
}
