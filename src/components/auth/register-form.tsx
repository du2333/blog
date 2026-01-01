import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreviousLocation } from "@/hooks/use-previous-location";
import { authClient } from "@/lib/auth/auth.client";

const registerSchema = z
	.object({
		name: z.string().min(2, "昵称至少 2 位"),
		email: z.string().email("无效的邮箱格式"),
		password: z.string().min(8, "密码至少 8 位"),
		confirmPassword: z.string(),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "密码输入不一致",
		path: ["confirmPassword"],
	});

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterForm() {
	const { isEmailVerficationRequired } = useRouteContext({ from: "/_auth" });
	const navigate = useNavigate();
	const [isSuccess, setIsSuccess] = React.useState(false);
	const previousLocation = usePreviousLocation();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterSchema>({
		resolver: standardSchemaResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterSchema) => {
		const { error } = await authClient.signUp.email({
			email: data.email,
			password: data.password,
			name: data.name,
			callbackURL: `${window.location.origin}/verify-email`,
		});

		if (error) {
			toast.error("注册失败", {
				description: error.message || "服务器连接异常，请稍后重试。",
			});
			return;
		}

		queryClient.removeQueries({ queryKey: ["session"] });

		if (isEmailVerficationRequired) {
			setIsSuccess(true);
			toast.success("账号已创建", {
				description: "验证邮件已发送，请检查您的收件箱。",
			});
		}
		else {
			toast.success("注册成功", {
				description: "账号已激活。",
			});
			navigate({ to: previousLocation });
		}
	};

	if (isSuccess) {
		return (
			<div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
				<div className="space-y-4">
					<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
						<Check size={24} />
					</div>
					<h3 className="text-2xl font-serif font-medium tracking-tight">
						验证您的邮箱
					</h3>
					<p className="text-sm font-light text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
						一封验证邮件已发送至您的邮箱。请点击邮件中的链接以激活账户。
					</p>
				</div>
				<Button
					onClick={() => navigate({ to: "/login" })}
					variant="outline"
					className="w-full h-14 text-[11px] uppercase tracking-[0.4em] font-medium"
				>
					返回登录
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			<div className="space-y-6">
				{/* Name */}
				<div className="space-y-2 group">
					<label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
						用户昵称
					</label>
					<Input
						type="text"
						{...register("name")}
						className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
						placeholder="输入您的昵称"
					/>
					{errors.name && (
						<span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
							{errors.name.message}
						</span>
					)}
				</div>

				{/* Email */}
				<div className="space-y-2 group">
					<label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
						邮箱地址
					</label>
					<Input
						type="email"
						{...register("email")}
						className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
						placeholder="example@mail.com"
					/>
					{errors.email && (
						<span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
							{errors.email.message}
						</span>
					)}
				</div>

				{/* Passwords */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2 group">
						<label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
							密码
						</label>
						<Input
							type="password"
							{...register("password")}
							className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
							placeholder="••••••••"
						/>
						{errors.password && (
							<span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
								{errors.password.message}
							</span>
						)}
					</div>
					<div className="space-y-2 group">
						<label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-focus-within:text-foreground transition-colors pl-1">
							确认密码
						</label>
						<Input
							type="password"
							{...register("confirmPassword")}
							className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-lg font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground shadow-none px-0"
							placeholder="••••••••"
						/>
						{errors.confirmPassword && (
							<span className="text-[9px] text-red-500 uppercase tracking-widest mt-1 block">
								{errors.confirmPassword.message}
							</span>
						)}
					</div>
				</div>
			</div>

			<Button
				type="submit"
				disabled={isSubmitting}
				className="w-full h-14 bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.4em] font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-3 group rounded-sm"
			>
				{isSubmitting
					? (
							<Loader2 className="animate-spin" size={16} />
						)
					: (
							<>
								<span>创建账户</span>
								<ArrowRight
									size={14}
									className="group-hover:translate-x-1 transition-transform"
								/>
							</>
						)}
			</Button>
		</form>
	);
}
