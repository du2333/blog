import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_auth/reset-link")({
  validateSearch: z.object({
    token: z.string().optional(),
    error: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token, error } = Route.useSearch();

  return (
    <>
      {/* Page Specific Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic tracking-tighter">
          Key{" "}
          <span className="text-zzz-cyan drop-shadow-[0_0_10px_rgba(0,204,255,0.3)]">
            Restoration
          </span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-2 tracking-[0.2em] uppercase">
          SECURE CHANNEL // UPDATE CREDENTIALS
        </p>
      </div>

      {/* Card Content */}
      <div className="bg-zzz-black border-2 border-zzz-gray shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative clip-corner-tr">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-16 h-1 bg-zzz-cyan"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zzz-gray"></div>

        <ResetPasswordForm token={token} error={error} />
      </div>
    </>
  );
}
