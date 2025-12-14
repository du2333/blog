import ConfirmationModal from "@/components/ui/confirmation-modal";
import { authClient } from "@/lib/auth/auth.client";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "../common/logo";

export function SideBar({
  isMobileSidebarOpen,
  closeMobileSidebar,
}: {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
}) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmSignOut = async () => {
    setIsLoggingOut(true);
    const { error } = await authClient.signOut();
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);

    if (error) {
      toast.error("LOGOUT FAILED", {
        description: "Failed to terminate session.",
      });
      return;
    }
    toast.success("SESSION TERMINATED", {
      description: "You have been logged out.",
    });
    navigate({ to: "/login" });
  };

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

  return (
    <>
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
        transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0
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
            NETWORK
          </div>

          <Link
            to="/"
            className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-zzz-lime transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Globe size={16} className="group-hover:animate-pulse" />
              Public Net
            </div>
            <ArrowUpRight
              size={12}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </Link>

          <div className="my-4"></div>

          <div className="px-4 text-[10px] text-gray-600 font-bold mb-2">
            SYSTEM
          </div>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={16} /> Config
          </Link>
        </nav>

        {/* User Status */}
        <div className="p-4 border-t border-zzz-gray bg-zzz-black shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-zzz-lime rounded-full animate-pulse"></div>
              <span className="text-xs text-zzz-lime font-bold">ONLINE</span>
            </div>
            <button
              onClick={handleSignOutClick}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
          <div className="text-[10px] text-gray-500">ID: PHAETHON_01</div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmSignOut}
        title="TERMINATE SESSION"
        message="Are you sure you want to log out? "
        confirmLabel="TERMINATE"
        isLoading={isLoggingOut}
      />
    </>
  );
}
