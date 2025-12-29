import type { SystemConfig } from "@/features/config/config.schema";
import {
	AlertCircle,
	CheckCircle2,
	Eye,
	EyeOff,
	Loader2,
	Wifi,
} from "lucide-react";
import { useState } from "react";
import DropdownMenu from "@/components/ui/dropdown-menu";
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
					<div
						className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500 ${
							status === "SUCCESS"
								? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-500"
								: status === "ERROR"
									? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/5 dark:border-rose-500/20 dark:text-rose-500"
									: "bg-muted border-border text-muted-foreground"
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
					</div>
				)}
			</div>

			<div className="space-y-px">
				{/* Property Row: Provider */}
				<div className="group flex flex-col sm:flex-row sm:items-center py-8 gap-4 sm:gap-0 border-b border-border/30">
					<div className="w-56 shrink-0 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
						服务平台
					</div>
					<div className="flex-1 flex gap-2.5">
						{(["GOOGLE", "DEEPSEEK"] as AiProvider[]).map(p => (
							<button
								key={p}
								onClick={() => {
									onChange({ ...value, activeProvider: p });
									setStatus("IDLE");
								}}
								className={`px-5 py-2.5 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all border ${
									provider === p
										? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-black/5"
										: "border-border text-muted-foreground hover:border-foreground"
								}`}
							>
								{p}
							</button>
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
							<input
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
								className="w-full bg-transparent text-sm font-mono text-foreground focus:outline-none placeholder:text-muted-foreground/30 pr-10"
							/>
							<button
								onClick={() => setShowKey(!showKey)}
								className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
							>
								{showKey
									? (
											<EyeOff size={18} strokeWidth={1.5} />
										)
									: (
											<Eye size={18} strokeWidth={1.5} />
										)}
							</button>
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
						<button
							onClick={handleTest}
							disabled={status === "TESTING" || !isConfigured}
							className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
								!isConfigured
									? "bg-muted text-muted-foreground/50 cursor-not-allowed"
									: status === "TESTING"
										? "bg-primary text-primary-foreground animate-pulse"
										: "border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground"
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
						</button>
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
