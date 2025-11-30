import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="min-h-screen bg-zzz-black text-zzz-white selection:bg-zzz-lime selection:text-black font-body relative">
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-stripe-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
        <div className="w-full h-1 bg-white/5 absolute top-0 animate-[scan_8s_linear_infinite]"></div>
      </div>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-10rem)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
