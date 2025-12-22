import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth/auth.client";

const forgotPasswordSchema = z.object({
	email: z.string().email("无效的邮箱格式"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
	const navigate = useNavigate();
	const [isSent, setIsSent] = useState(false);
	const [sentEmail, setSentEmail] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordSchema>({
		resolver: standardSchemaResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordSchema) => {
		const { error } = await authClient.requestPasswordReset({
			email: data.email,
			redirectTo: `${window.location.origin}/reset-link`,
		});

		if (error) {
			toast.error("重置邮件发送失败");
			return;
		}

		setSentEmail(data.email);
		setIsSent(true);
		toast.success("重置邮件已发送", {
			description: "请检查您的收件箱以获取重置链接。",
		});
	};

	if (isSent) {
		return (
			<div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
				<div className="space-y-4">
					<div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
						<Check size={24} className="text-zinc-900 dark:text-zinc-100" />
					</div>
					<h3 className="text-2xl font-serif font-medium tracking-tight">
						查收您的邮件
					</h3>
					<p className="text-sm font-light text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
						重置密码链接已发送至{" "}
						<span className="text-zinc-900 dark:text-zinc-100 font-medium">
							{sentEmail}
						</span>
						。
					</p>
				</div>
				<button
					onClick={() => navigate({ to: "/login" })}
					className="w-full h-14 border border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-[0.4em] font-medium hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all"
				>
					返回登录
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
			<div className="space-y-2">
				<p className="text-sm font-light text-zinc-500 dark:text-zinc-400 leading-relaxed italic border-l border-zinc-100 dark:border-zinc-900 pl-6">
					请输入您的注册邮箱，我们将向您发送重置密码的链接。
				</p>
			</div>

			<div className="space-y-6">
				<div className="space-y-2 group">
					<label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
						注册邮箱
					</label>
					<input
						type="email"
						{...register("email")}
						className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 text-lg font-light focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all placeholder-zinc-200 dark:placeholder-zinc-800"
						placeholder="example@mail.com"
					/>
					{errors.email && (
						<span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
							{errors.email.message}
						</span>
					)}
				</div>
			</div>

			<div className="space-y-6">
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.4em] font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
				>
					{isSubmitting ? (
						<Loader2 className="animate-spin" size={16} />
					) : (
						<span>发送重置链接</span>
					)}
				</button>

				<button
					type="button"
					onClick={() => navigate({ to: "/login" })}
					className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
				>
					<ArrowLeft size={12} strokeWidth={1.5} />
					<span>返回登录</span>
				</button>
			</div>
		</form>
	);
}
