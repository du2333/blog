import { Logo } from "@/components/common/logo";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { authClient } from "@/lib/auth/auth.client";
import { useQueryClient } from "@tanstack/react-query";
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
      label: "文章管理",
      exact: false,
    },
    {
      path: "/admin/media" as const,
      icon: ImageIcon,
      label: "媒体库",
      exact: false,
    },
  ];

  const activeClass =
    "text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-white/5 font-medium";
  const inactiveClass =
    "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/30 dark:hover:bg-white/[0.02]";

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-white/80 dark:bg-black/80 z-[60] md:hidden backdrop-blur-sm animate-in fade-in duration-500"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-[70] w-72 border-r border-zinc-100 dark:border-white/5 flex flex-col bg-white dark:bg-[#050505]
        transform transition-transform duration-500 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-between px-8 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
            <span className="font-serif text-xl tracking-tight">控制台</span>
          </Link>
          <button
            onClick={closeMobileSidebar}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                activeOptions={{ exact: item.exact }}
                className={`flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-all rounded-sm ${inactiveClass}`}
                activeProps={{
                  className: `${activeClass}`,
                }}
              >
                <item.icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="space-y-4">
            <div className="px-4 text-[9px] uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-700 font-bold">
              站点
            </div>
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center justify-between px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-all rounded-sm group ${inactiveClass}`}
              >
                <div className="flex items-center gap-3">
                  <Globe size={16} strokeWidth={1.5} />
                  查看前台
                </div>
                <ArrowUpRight
                  size={14}
                  className="opacity-0 group-hover:opacity-40 transition-opacity"
                />
              </Link>
              <Link
                to="/admin/settings"
                className={`flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-all rounded-sm ${inactiveClass}`}
                activeProps={{
                  className: `${activeClass}`,
                }}
              >
                <Settings size={16} strokeWidth={1.5} />
                系统设置
              </Link>
            </div>
          </div>
        </nav>

        {/* User Status */}
        <div className="p-6 border-t border-zinc-100 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-medium">
                系统在线
              </span>
            </div>
            <button
              onClick={handleSignOutClick}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
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
