import { Logo } from "@/components/logo";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Terminal,
  X,
} from "lucide-react";
import { useState } from "react";
import Toaster from "@/components/ui/toaster";

const navItems = [
  {
    path: "/admin" as const,
    icon: LayoutDashboard,
    label: "Overview",
    exact: true,
  },
  {
    path: "/admin/posts" as const,
    icon: FileText,
    label: "Data Logs",
    exact: false,
  },
  {
    path: "/admin/media" as const,
    icon: ImageIcon,
    label: "Memory Bank",
    exact: false,
  },
];

const activeClass = "bg-zzz-orange/10 text-zzz-orange border-zzz-orange";
const inactiveClass =
  "text-gray-400 border-transparent hover:bg-white/5 hover:text-white";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-55 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-60 w-64 border-r border-zzz-gray flex flex-col bg-zzz-black/95 backdrop-blur md:bg-zzz-dark/50 
        transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${
          isMobileSidebarOpen
            ? "translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]"
            : "-translate-x-full"
        }
      `}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-zzz-gray bg-zzz-black shrink-0">
          <div className="flex items-center">
            <Logo className="w-6 h-6 text-zzz-orange mr-3" />
            <div>
              <div className="font-sans font-black uppercase text-lg italic leading-none">
                Proxy<span className="text-zzz-orange">HDD</span>
              </div>
              <div className="text-[10px] text-gray-500 tracking-widest">
                ADMIN_MODE
              </div>
            </div>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              activeOptions={{ exact: item.exact }}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all clip-corner-tr border-l-2 ${inactiveClass}`}
              activeProps={{
                className: `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all clip-corner-tr border-l-2 ${activeClass}`,
              }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}

          <div className="my-6 border-t border-zzz-gray opacity-50"></div>

          <div className="px-4 text-[10px] text-gray-600 font-bold mb-2">
            SYSTEM
          </div>
          <button
            className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-not-allowed opacity-50"
            disabled
            title="Coming soon"
          >
            <Settings size={16} /> Config
          </button>
        </nav>

        {/* User Status */}
        <div className="p-4 border-t border-zzz-gray bg-zzz-black shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-zzz-lime rounded-full animate-pulse"></div>
              <span className="text-xs text-zzz-lime font-bold">ONLINE</span>
            </div>
            <Link
              to="/"
              className="text-gray-500 hover:text-white"
              title="Logout"
            >
              <LogOut size={14} />
            </Link>
          </div>
          <div className="text-[10px] text-gray-500">ID: PHAETHON_01</div>
        </div>
      </aside>

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
      <Toaster />
    </div>
  );
}
