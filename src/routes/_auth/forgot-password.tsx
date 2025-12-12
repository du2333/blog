import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      {/* Page Specific Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic tracking-tighter">
          Signal{" "}
          <span className="text-zzz-orange drop-shadow-[0_0_10px_rgba(255,102,0,0.3)]">
            Recovery
          </span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-2 tracking-[0.2em] uppercase">
          RESTORE ACCESS // EMERGENCY PROTOCOL
        </p>
      </div>

      {/* Card Content */}
      <div className="bg-zzz-black border-2 border-zzz-gray shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative clip-corner-tr">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-16 h-1 bg-zzz-orange"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zzz-gray"></div>

        <ForgotPasswordForm />
      </div>
    </>
  );
}
