import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/_auth/verify-email")({
	validateSearch: z.object({
		error: z.string().optional().catch(undefined),
	}),
	beforeLoad: ({ context }) => {
		// If email verification is not required, redirect to login
		if (!context.isEmailVerficationRequired) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { error } = Route.useSearch();
	const navigate = useNavigate();

	const [status, setStatus] = useState<"ANALYZING" | "SUCCESS" | "ERROR">(
		"ANALYZING",
	);

	useEffect(() => {
		const analyzeSignal = async () => {
			// Small artificial delay for smooth transition
			await new Promise(r => setTimeout(r, 1500));

			if (error) {
				setStatus("ERROR");
			}
			else {
				setStatus("SUCCESS");
			}
		};

		analyzeSignal();
	}, [error]);

	return (
		<div className="space-y-12">
			<header className="text-center space-y-2">
				<h1 className="text-4xl font-serif font-medium tracking-tight transition-colors duration-700">
					{status === "ANALYZING" && "正在验证身份"}
					{status === "SUCCESS" && "验证成功"}
					{status === "ERROR" && "验证失败"}
				</h1>
			</header>

			<div className="flex flex-col items-center justify-center space-y-10 py-10">
				<div className="relative">
					{status === "ANALYZING" && (
						<div className="w-24 h-24 rounded-full border border-border flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
							<Loader2 size={32} className="text-zinc-400 animate-spin" />
						</div>
					)}

					{status === "SUCCESS" && (
						<div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center animate-in zoom-in duration-700">
							<Check size={32} className="text-foreground" />
						</div>
					)}

					{status === "ERROR" && (
						<div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900 flex items-center justify-center animate-in shake duration-500">
							<AlertCircle size={32} className="text-red-500" />
						</div>
					)}
				</div>

				<div className="text-center space-y-6 w-full">
					{status === "ANALYZING" && (
						<p className="text-sm font-light text-muted-foreground leading-relaxed italic">
							请稍候，我们正在核对您的身份认证令牌...
						</p>
					)}

					{status === "SUCCESS" && (
						<>
							<p className="text-sm font-light text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
								您的邮箱已成功验证。
							</p>
							<button
								onClick={() => navigate({ to: "/" })}
								className="w-full h-14 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.4em] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-3 group"
							>
								<span>返回主页</span>
								<ArrowRight
									size={14}
									className="group-hover:translate-x-1 transition-transform"
								/>
							</button>
						</>
					)}

					{status === "ERROR" && (
						<>
							<p className="text-sm font-light text-red-500 leading-relaxed max-w-[280px] mx-auto">
								{error === "invalid_token"
									? "验证链接已失效或已过期。"
									: "验证过程中发生错误，请重试。"}
							</p>
							<div className="space-y-4">
								<button
									onClick={() => navigate({ to: "/login" })}
									className="w-full h-14 border border-border text-[11px] uppercase tracking-[0.4em] font-medium hover:bg-primary hover:text-primary-foreground transition-all"
								>
									返回登录
								</button>
								<button
									onClick={() => navigate({ to: "/login" })}
									className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
								>
									重新发送验证邮件
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
