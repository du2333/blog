import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { emailConfiguredQuery, sessionQuery } from "@/features/auth/queries";
import { CACHE_CONTROL } from "@/lib/constants";
import { useNavigateBack } from "@/hooks/use-navigate-back";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.fetchQuery(sessionQuery);
    const isEmailConfigured =
      await context.queryClient.fetchQuery(emailConfiguredQuery);

    if (session && !location.pathname.includes("verify-email")) {
      throw redirect({ to: "/" });
    }

    return { session, isEmailConfigured };
  },
  component: RouteComponent,
  headers: () => {
    return CACHE_CONTROL.private;
  },
});

function RouteComponent() {
  const navigateBack = useNavigateBack();
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* --- Header --- */}
      <header className="h-16 flex items-center px-6 md:px-12">
        <button
          onClick={navigateBack}
          className="text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          [ ← 返回 ]
        </button>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="h-16"></footer>
    </div>
  );
}
