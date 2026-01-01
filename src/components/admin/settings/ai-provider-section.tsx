import {
	AlertCircle,
	CheckCircle2,
	Eye,
	EyeOff,
	Loader2,
	Wifi,
} from "lucide-react";
import { useState } from "react";
import type { SystemConfig } from "@/features/config/config.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DropdownMenu from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DeepSeekModels, GoogleModels } from "@/lib/ai";

type AiProvider = "GOOGLE" | "DEEPSEEK";
type ConnectionStatus = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";

const PROVIDER_CONFIG = {
	GOOGLE: {
		name: "Google Gemini",
		models: GoogleModels,
	},
	DEEPSEEK: {
		name: "DeepSeek AI",
		models: DeepSeekModels,
	},
};

interface AiSectionProps {
	value: NonNullable<SystemConfig["ai"]>;
	onChange: (cfg: NonNullable<SystemConfig["ai"]>) => void;
	testAiConnection: (params: {
		data: { provider: "GOOGLE" | "DEEPSEEK"; apiKey: string; model: string };
	}) => Promise<{ success: boolean; error?: string }>;
}

export function AiProviderSection({
	value,
	onChange,
	testAiConnection,
}: AiSectionProps) {
	const [showKey, setShowKey] = useState(false);
	const [status, setStatus] = useState<ConnectionStatus>("IDLE");
	const [statusMsg, setStatusMsg] = useState<string>("");

	const provider = (value.activeProvider || "GOOGLE") as AiProvider;
	const currentProviderConfig = value.providers?.[provider];
	const isConfigured = !!currentProviderConfig?.apiKey?.trim();
	const currentConfig = PROVIDER_CONFIG[provider];

	const handleTest = async () => {
		if (!isConfigured)
			return;
		setStatus("TESTING");
		setStatusMsg("正在验证服务连通性...");

		try {
			const result = await testAiConnection({
				data: {
					provider,
					apiKey: currentProviderConfig?.apiKey || "",
					model: currentProviderConfig?.model || "",
				},
			});

			if (result.success) {
				setStatus("SUCCESS");
				setStatusMsg("服务连接正常，模型响应就绪");
			}
			else {
				setStatus("ERROR");
				setStatusMsg(result.error || "授权验证失败，请检查密钥");
			}
		}
		catch {
			setStatus("ERROR");
			setStatusMsg("网络异常或服务暂时不可用");
		}
	};

	return (
		<div className="space-y-16">
			{/* Section Header */}
			<div className="flex items-end justify-between border-b border-border/50 pb-10">
				<div className="space-y-1.5">
					<h3 className="text-4xl font-serif font-medium tracking-tight text-foreground">
						AI 智能
					</h3>
					<p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold opacity-80">
						Artificial Intelligence Configuration
					</p>
				</div>
				{status !== "IDLE" && (
					<Badge
						variant={status === "SUCCESS" ? "default" : status === "ERROR" ? "destructive" : "secondary"}
						className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500 h-auto ${
							status === "SUCCESS"
								? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-none hover:bg-emerald-500/10"
								: status === "ERROR"
									? "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-none hover:bg-rose-500/10"
									: "bg-muted border-border text-muted-foreground shadow-none"
						}`}
					>
						{status === "TESTING"
							? (
									<Loader2 size={10} className="animate-spin" />
								)
							: status === "SUCCESS"
								? (
										<CheckCircle2 size={10} />
									)
								: (
										<AlertCircle size={10} />
									)}
						{status === "TESTING"
							? "Validating"
							: status === "SUCCESS"
								? "Connected"
								: "Connection Failed"}
					</Badge>
				)}
			</div>

			<div className="space-y-px">
				{/* Property Row: Provider */}
				<div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
					<div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
						服务平台
					</div>
					<div className="flex-1 flex gap-2.5">
						{(["GOOGLE", "DEEPSEEK"] as Array<AiProvider>).map(p => (
							<Button
								key={p}
								variant={provider === p ? "default" : "outline"}
								size="sm"
								onClick={() => {
									onChange({ ...value, activeProvider: p });
									setStatus("IDLE");
								}}
								className={`px-5 h-9 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all ${
									provider === p
										? "shadow-lg shadow-black/5"
										: "text-muted-foreground hover:border-foreground"
								}`}
							>
								{p}
							</Button>
						))}
					</div>
				</div>

				{/* Property Row: API Key */}
				<div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
					<div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
						授权密钥
					</div>
					<div className="flex-1 flex items-center gap-4">
						<div className="flex-1 relative">
							<Input
								type={showKey ? "text" : "password"}
								value={currentProviderConfig?.apiKey || ""}
								placeholder="Enter your API Key..."
								onChange={(e) => {
									onChange({
										...value,
										providers: {
											...value.providers,
											[provider]: {
												...value.providers?.[provider],
												apiKey: e.target.value,
											},
										},
									});
									setStatus("IDLE");
								}}
								className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/30 pr-10 h-auto"
							/>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowKey(!showKey)}
								className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors h-8 w-8 rounded-sm"
							>
								{showKey
									? (
											<EyeOff size={18} strokeWidth={1.5} />
										)
									: (
											<Eye size={18} strokeWidth={1.5} />
										)}
							</Button>
						</div>
					</div>
				</div>

				{/* Property Row: Model */}
				<div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
					<div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
						模型版本
					</div>
					<div className="flex-1">
						<DropdownMenu
							value={currentProviderConfig?.model || currentConfig.models[0]}
							onChange={(val) => {
								onChange({
									...value,
									providers: {
										...value.providers,
										[provider]: {
											...value.providers?.[provider],
											model: val,
										},
									},
								});
							}}
							options={currentConfig.models.map(m => ({
								label: m,
								value: m,
							}))}
							className="w-full sm:w-fit"
						/>
					</div>
				</div>

				{/* Property Row: Test Connection */}
				<div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0">
					<div className="w-48 shrink-0" />
					<div className="flex-1 flex items-center gap-6">
						<Button
							variant={status === "TESTING" ? "default" : "outline"}
							onClick={handleTest}
							disabled={status === "TESTING" || !isConfigured}
							className={`flex items-center gap-3 px-6 h-12 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
								!isConfigured
									? "bg-muted text-muted-foreground/50 cursor-not-allowed border-none"
									: status === "TESTING"
										? "animate-pulse"
										: "text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent"
							}`}
						>
							{status === "TESTING"
								? (
										<Loader2 size={14} className="animate-spin" />
									)
								: (
										<Wifi size={14} />
									)}
							验证服务连通性
						</Button>
						{statusMsg && (
							<p
								className={`text-[10px] font-medium transition-all duration-500 animate-in fade-in slide-in-from-left-2 ${
									status === "SUCCESS"
										? "text-green-600 dark:text-green-500"
										: status === "ERROR"
											? "text-red-600 dark:text-red-500"
											: "text-muted-foreground"
								}`}
							>
								{statusMsg}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
