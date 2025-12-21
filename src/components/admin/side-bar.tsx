import { Logo } from "@/components/common/logo";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { authClient } from "@/lib/auth/auth.client";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SideBar({
  isMobileSidebarOpen,
  closeMobileSidebar,
}: {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      toast.error("注销失败", {
        description: "请重试。",
      });
      return;
    }

    queryClient.removeQueries({ queryKey: ["session"] });

    toast.success("已退出登录");
    navigate({ to: "/login" });
  };

  const navItems = [
    {
      path: "/admin" as const,
      icon: LayoutDashboard,
      label: "概览",
      exact: true,
    },
    {
      path: "/admin/posts" as const,
      icon: FileText,
      label: "文章",
      exact: false,
    },
    {
      path: "/admin/media" as const,
      icon: ImageIcon,
      label: "媒体",
      exact: false,
    },
    {
      path: "/admin/settings" as const,
      icon: Settings,
      label: "设置",
      exact: false,
    },
  ];

  const activeClass =
    "text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-white/5 font-bold";
  const inactiveClass =
    "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-white/[0.02]";

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-white/80 dark:bg-black/80 z-60 md:hidden backdrop-blur-sm animate-in fade-in duration-500"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-70 w-64 md:w-20 lg:w-64 border-r border-zinc-100 dark:border-white/5 flex flex-col bg-white dark:bg-[#050505]
        transform transition-all duration-500 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0
        ${
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center lg:justify-between px-6 shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-zinc-950 dark:text-zinc-50" />
            <span className="font-serif text-xl tracking-tight hidden lg:block">
              管理
            </span>
          </Link>
          <button
            onClick={closeMobileSidebar}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              activeOptions={{ exact: item.exact }}
              className={`flex items-center justify-center lg:justify-start gap-4 px-4 py-4 text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm group ${inactiveClass}`}
              activeProps={{
                className: `${activeClass}`,
              }}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="shrink-0 transition-transform group-hover:scale-110"
                  />
                  <span className="hidden lg:block truncate">{item.label}</span>
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* User Status / Logout */}
        <div className="p-4 border-t border-zinc-100 dark:border-white/5 shrink-0 flex flex-col items-center">
          <button
            onClick={handleSignOutClick}
            className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-full transition-all"
            title="退出登录"
          >
            <LogOut size={20} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmSignOut}
        title="确认退出"
        message="您确定要结束当前管理会话并注销吗？"
        confirmLabel="确认退出"
        isLoading={isLoggingOut}
      />
    </>
  );
}
