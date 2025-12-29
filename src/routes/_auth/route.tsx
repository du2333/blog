import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
	emailVerficationRequiredQuery,
	sessionQuery,
} from "@/features/auth/auth.query";
import { CACHE_CONTROL } from "@/lib/constants";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context, location }) => {
		const session = await context.queryClient.fetchQuery(sessionQuery);
		const isEmailVerficationRequired = await context.queryClient.fetchQuery(
			emailVerficationRequiredQuery,
		);

		if (session && !location.pathname.includes("verify-email")) {
			throw redirect({ to: "/" });
		}

		return { session, isEmailVerficationRequired };
	},
	component: RouteComponent,
	headers: () => {
		return CACHE_CONTROL.private;
	},
});

function RouteComponent() {
	return (
		<div className="min-h-screen w-full flex flex-col relative overflow-hidden transition-colors duration-500">
			{/* --- Background Decorative Elements --- */}
			<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 in-[.dark]:opacity-100">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.02)_0%,transparent_100%)] in-[.dark]:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.02)_0%,transparent_100%)]"></div>
			</div>

			{/* --- Header --- */}
			<header className="relative z-50 h-24 flex items-center px-6 md:px-12">
				<Link
					to="/"
					className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft
						size={18}
						strokeWidth={1.5}
						className="group-hover:-translate-x-1 transition-transform"
					/>
					<span className="text-[10px] uppercase tracking-[0.4em]">
						返回主页
					</span>
				</Link>
			</header>

			{/* --- Main Content --- */}
			<main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
				<div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
					{/* Shared Logo */}
					<div className="flex justify-center">
						<Link to="/" className="group">
							<div className="w-12 h-12">
								<div className="w-full h-full border-[1.5px] border-current rounded-full flex items-center justify-center p-[20%]">
									<div className="w-full h-full bg-current rounded-full"></div>
								</div>
							</div>
						</Link>
					</div>

					<div className="space-y-8">
						<Outlet />
					</div>
				</div>
			</main>

			{/* --- Footer --- */}
			<footer className="h-24 flex items-center justify-center relative z-10 px-6"></footer>
		</div>
	);
}
