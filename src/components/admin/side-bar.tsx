import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { authClient } from "@/lib/auth/auth.client";

export function SideBar({
  isMobileSidebarOpen,
  closeMobileSidebar,
}: {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;

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

  const activeClass = "bg-accent font-bold";
  const inactiveClass =
    "text-muted-foreground hover:text-foreground hover:bg-accent/50";

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-60 md:hidden backdrop-blur-sm animate-in fade-in duration-500"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-70 w-72 md:w-20 lg:w-64 border-r border-border flex flex-col
        transform transition-all duration-500 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0
        ${
          isMobileSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-between px-6 shrink-0 border-b border-border/50">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 relative">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-serif text-xl tracking-tight md:hidden lg:block">
              控制台
            </span>
          </Link>
          <button
            onClick={closeMobileSidebar}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-sm bg-accent text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              activeOptions={{ exact: item.exact }}
              className={`flex items-center justify-center md:justify-center lg:justify-start gap-4 px-4 py-4 text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm group ${inactiveClass}`}
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
                  <span className="md:hidden lg:block truncate font-bold">
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 md:p-2 lg:p-6 border-t border-border shrink-0 space-y-4">
          <div className="flex items-center justify-between md:flex-col lg:flex-row gap-2 px-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold md:hidden lg:block">
              主题模式
            </span>
            <ThemeToggle className="w-8 h-8 md:w-12 md:h-12 lg:w-8 lg:h-8 rounded-sm" />
          </div>

          <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:hidden lg:flex min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-zinc-300">
                    <User size={16} />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate">
                  {user?.name || "管理员"}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground truncate">
                  {user?.role === "admin" ? "Admin" : "User"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOutClick}
              className="w-10 h-10 md:w-12 md:h-12 lg:w-10 lg:h-10 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-sm transition-all shrink-0"
              title="退出登录"
            >
              <LogOut size={18} strokeWidth={1.5} />
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
