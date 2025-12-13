import { RegisterForm } from "@/components/auth/register-form";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      {/* Page Specific Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic tracking-tighter">
          Proxy{" "}
          <span className="text-zzz-cyan drop-shadow-[0_0_10px_rgba(0,204,255,0.3)]">
            Registration
          </span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-2 tracking-[0.2em] uppercase">
          NEW ENTRY // INTER-KNOT DATABASE
        </p>
      </div>

      {/* Card Content */}
      <div className="bg-zzz-black border-2 border-zzz-gray shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative clip-corner-tr">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-16 h-1 bg-zzz-cyan"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zzz-gray"></div>

        <RegisterForm />

        <div className="mt-6 text-center pt-6 border-t border-zzz-gray/30">
          <span className="text-[10px] font-mono text-gray-600 uppercase">
            Already registered?{" "}
          </span>
          <Link
            to="/login"
            className="text-[10px] font-mono font-bold text-zzz-cyan hover:underline uppercase tracking-wider ml-2"
          >
            Access Terminal
          </Link>
        </div>
      </div>
    </>
  );
}
