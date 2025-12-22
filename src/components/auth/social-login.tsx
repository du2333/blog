import { Github, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePreviousLocation } from "@/hooks/use-previous-location";
import { authClient } from "@/lib/auth/auth.client";

export function SocialLogin({ redirectTo }: { redirectTo?: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const previousLocation = usePreviousLocation();

	const handleGithubLogin = async () => {
		if (isLoading) return;

		setIsLoading(true);

		const { error } = await authClient.signIn.social({
			provider: "github",
			errorCallbackURL: `${window.location.origin}/login`,
			callbackURL: `${window.location.origin}${redirectTo ?? previousLocation}`,
		});

		if (error) {
			toast.error("第三方登录失败", {
				description: error.message,
			});
			setIsLoading(false);
			return;
		}

		setIsLoading(false);
	};

	return (
		<div className="space-y-6">
			<div className="relative flex items-center">
				<div className="grow h-px bg-border"></div>
				<span className="shrink-0 mx-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
					或者通过
				</span>
				<div className="grow h-px bg-border"></div>
			</div>

			<button
				type="button"
				onClick={handleGithubLogin}
				disabled={isLoading}
				className="group w-full h-14 border border-border flex items-center justify-center gap-3 transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? (
					<Loader2 size={18} className="text-zinc-400 animate-spin" />
				) : (
					<Github size={18} />
				)}

				<span className="text-[11px] uppercase tracking-[0.4em] font-medium">
					{isLoading ? "正在连接..." : "Github 账号"}
				</span>
			</button>
		</div>
	);
}
