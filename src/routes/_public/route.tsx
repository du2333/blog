import { UserProfileModal } from "@/components/auth/user-profile-modal";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Navbar } from "@/components/layout/navbar";
import { SearchCommandCenter } from "@/components/layout/search-command-center";
import { authClient } from "@/lib/auth/auth.client";
import { CACHE_CONTROL } from "@/lib/cache/cache-control";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
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
    { label: "Transmission", to: "/", id: "transmission", color: "zzz-lime" },
    { label: "Database", to: "/database", id: "database", color: "zzz-lime" },
  ];

  const { data: session } = authClient.useSession();
  const router = useRouter();
  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error("LOGOUT FAILED", {
        description: "Failed to terminate session.",
      });
      return;
    }
    toast.success("SESSION TERMINATED", {
      description: "You have been logged out.",
    });
    router.invalidate();
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
    <div className="min-h-screen bg-zzz-black text-zzz-white selection:bg-zzz-lime selection:text-black font-body relative">
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-stripe-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
        <div className="w-full h-1 bg-white/5 absolute top-0 animate-[scan_8s_linear_infinite]"></div>
      </div>
      <Navbar
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        user={session?.user}
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
      <main className="flex flex-col min-h-screen container mx-auto px-4 py-8 md:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
