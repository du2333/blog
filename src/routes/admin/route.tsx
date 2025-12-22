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
import { CACHE_CONTROL } from "@/lib/cache/cache-control";

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
		<div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 flex relative transition-colors duration-500 font-sans">
			<SideBar
				isMobileSidebarOpen={isMobileSidebarOpen}
				closeMobileSidebar={closeMobileSidebar}
			/>

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col min-w-0">
				{/* Top Header */}
				<header className="h-16 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shrink-0">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setIsMobileSidebarOpen(true)}
							className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
						>
							<Menu size={20} />
						</button>
						<div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
							<span className="hidden sm:inline">Admin</span>
							<span className="hidden sm:inline opacity-30">/</span>
							<span className="text-zinc-950 dark:text-zinc-50 font-bold tracking-widest uppercase">
								Workspace
							</span>
						</div>
					</div>

					<div className="flex items-center gap-6">
						<Link
							to="/"
							className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors group"
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
