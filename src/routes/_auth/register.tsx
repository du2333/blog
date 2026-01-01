import { Link, createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/auth/register-form";

export const Route = createFileRoute("/_auth/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-10">
			<header className="text-center space-y-2">
				<h1 className="text-4xl font-serif font-medium tracking-tight">注册</h1>
			</header>

			<div className="space-y-10">
				<RegisterForm />

				<div className="text-center pt-6">
					<p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
						已有账户?
						{" "}
						<Link
							to="/login"
							className="text-foreground font-medium hover:underline underline-offset-4 ml-2"
						>
							前往登录
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
