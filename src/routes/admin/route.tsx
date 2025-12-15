import { SideBar } from "@/components/admin/side-bar";
import { getSessionFn } from "@/features/auth/auth.api";
import { CACHE_CONTROL } from "@/lib/cache/cache-control";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Menu, Terminal } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await getSessionFn();

    if (!session) {
      throw redirect({ to: "/login" });
    }
    if (session.user?.role !== "admin") {
      throw redirect({ to: "/" });
    }

    return { session };
  },
  component: AdminLayout,
  headers: () => {
    return CACHE_CONTROL.private;
  },
});

function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex relative">
      <SideBar
        isMobileSidebarOpen={isMobileSidebarOpen}
        closeMobileSidebar={closeMobileSidebar}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-dot-pattern min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-zzz-gray bg-zzz-black/80 backdrop-blur flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden text-zzz-orange hover:bg-zzz-orange/10 p-1 rounded"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Terminal size={12} />
              <span className="hidden sm:inline">ROOT</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-white">COMMAND_CENTER</span>
            </div>
          </div>
          <div className="text-[10px] text-zzz-gray font-bold tracking-[0.2em]">
            SECURE_CONNECTION // ENCRYPTED
          </div>
        </header>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
