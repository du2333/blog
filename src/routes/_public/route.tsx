import { UserProfileModal } from "@/components/auth/user-profile-modal";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Navbar } from "@/components/layout/navbar";
import { SearchCommandCenter } from "@/components/layout/search-command-center";
import { authClient } from "@/lib/auth/auth.client";
import { CACHE_CONTROL } from "@/lib/cache/cache-control";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
  headers: () => {
    return CACHE_CONTROL.public;
  },
});

function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navOptions = [
    { label: "主页", to: "/", id: "transmission", color: "zzz-lime" },
    { label: "文章", to: "/database", id: "database", color: "zzz-lime" },
  ];

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const queryClient = useQueryClient();
  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error("会话终止失败, 请稍后重试。", {
        description: error.message,
      });
      return;
    }

    queryClient.removeQueries({ queryKey: ["session"] });

    toast.success("会话已终止", {
      description: "你已安全退出当前会话。",
    });
  };
  // Global shortcut: Cmd/Ctrl + K to toggle search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isToggle) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-body relative">
      {/* --- Minimalist Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.02)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.02)_0%,transparent_100%)]"></div>
        {/* Subtle noise or grain could go here */}
      </div>

      <Navbar
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        user={session?.user}
        isLoading={isSessionPending}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        navOptions={navOptions}
      />
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={session?.user}
        logout={logout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        navOptions={navOptions}
      />
      <SearchCommandCenter
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={session?.user}
        logout={logout}
      />
      <main className="flex flex-col min-h-screen relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
