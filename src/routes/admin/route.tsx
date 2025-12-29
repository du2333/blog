import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { ArrowUpRight, Menu } from "lucide-react";
import { useState } from "react";
import { SideBar } from "@/components/admin/side-bar";
import { sessionQuery } from "@/features/auth/auth.query";
import { CACHE_CONTROL } from "@/lib/constants";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(sessionQuery);

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
		<div className="min-h-screen bg-background text-foreground flex relative transition-colors duration-500 font-sans">
			<SideBar
				isMobileSidebarOpen={isMobileSidebarOpen}
				closeMobileSidebar={closeMobileSidebar}
			/>

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col min-w-0">
				{/* Top Header */}
				<header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shrink-0">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setIsMobileSidebarOpen(true)}
							className="md:hidden p-2 hover:bg-accent rounded-sm transition-colors"
						>
							<Menu size={20} />
						</button>
						<div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
							<span className="hidden sm:inline">Admin</span>
							<span className="hidden sm:inline opacity-30">/</span>
							<span className="text-foreground font-bold tracking-widest uppercase">
								Workspace
							</span>
						</div>
					</div>

					<div className="flex items-center gap-6">
						<Link
							to="/"
							className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-foreground transition-colors group"
						>
							<span>查看前台</span>
							<ArrowUpRight
								size={12}
								className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
							/>
						</Link>
					</div>
				</header>

				{/* Content Scroll */}
				<div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
					<div className="max-w-7xl mx-auto">
						<Outlet />
					</div>
				</div>
			</main>
		</div>
	);
}
