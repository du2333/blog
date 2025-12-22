import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AiProviderSection } from "@/components/admin/settings/ai-provider-section";
import { EmailServiceSection } from "@/components/admin/settings/email-service-section";
import { MaintenanceSection } from "@/components/admin/settings/maintenance-section";
import { useSystemSetting } from "@/components/admin/settings/use-system-setting";
import { SectionSkeleton } from "@/components/skeletons/settings-skeleton";
import {
	DEFAULT_CONFIG,
	type SystemConfig,
} from "@/features/config/config.schema";

export const Route = createFileRoute("/admin/settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		settings,
		saveSettings,
		testAiConnection,
		testEmailConnection,
		isLoading,
	} = useSystemSetting();

	const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

	// 同步 settings 到本地 config 状态
	useEffect(() => {
		if (settings) {
			setConfig(settings);
		}
	}, [settings]);

	const [activeSection, setActiveSection] = useState<
		"ai" | "email" | "maintenance"
	>("ai");

	const [isSaving, setIsSaving] = useState(false);

	const handleSaveConfig = async () => {
		setIsSaving(true);
		try {
			await saveSettings({ data: config });
			toast.success("系统配置已生效");
		} catch (error) {
			toast.error("保存失败，请重试");
		} finally {
			setIsSaving(false);
		}
	};

	const navGroups = [
		{
			label: "服务配置",
			en: "SERVICES",
			items: [
				{ id: "ai" as const, label: "AI 智能", en: "Artificial Intelligence" },
				{ id: "email" as const, label: "邮件分发", en: "Email Distribution" },
			],
		},
		{
			label: "系统管理",
			en: "SYSTEM",
			items: [
				{ id: "maintenance" as const, label: "数据维护", en: "Maintenance" },
			],
		},
	];

	return (
		<div className="flex flex-col lg:flex-row gap-24 max-w-7xl mx-auto min-h-[calc(100vh-200px)] px-8 md:px-16 lg:px-24 pt-24 lg:pt-40">
			{/* Left Sticky Navigation */}
			<aside className="lg:w-80 shrink-0 lg:sticky lg:top-40 h-fit space-y-20 animate-in fade-in slide-in-from-left-4 duration-1000 fill-mode-both">
				<div className="space-y-3">
					<h1 className="text-6xl font-serif font-medium tracking-tighter leading-none text-zinc-950 dark:text-zinc-50">
						设置
					</h1>
					<p className="text-[11px] uppercase tracking-[0.5em] text-zinc-400 font-bold opacity-60">
						System Preferences
					</p>
				</div>

				<nav className="space-y-16">
					{navGroups.map((group) => (
						<div key={group.label} className="space-y-8">
							<div className="flex items-center gap-4">
								<span className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-300 dark:text-zinc-800">
									{group.en}
								</span>
								<div className="h-px flex-1 bg-zinc-100 dark:bg-white/5"></div>
							</div>
							<div className="flex flex-col gap-2">
								{group.items.map((item) => (
									<button
										key={item.id}
										onClick={() => setActiveSection(item.id)}
										className={`group flex flex-col items-start py-4 px-5 -mx-5 rounded-sm transition-all ${
											activeSection === item.id
												? "bg-zinc-50 dark:bg-white/5 shadow-sm"
												: "hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]"
										}`}
									>
										<span
											className={`text-[12px] uppercase tracking-[0.25em] font-bold transition-colors ${
												activeSection === item.id
													? "text-zinc-950 dark:text-zinc-50"
													: "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"
											}`}
										>
											{item.label}
										</span>
										<span
											className={`text-[9px] uppercase tracking-[0.2em] font-mono mt-1 transition-colors ${
												activeSection === item.id
													? "text-zinc-500"
													: "text-zinc-300 dark:text-zinc-800"
											}`}
										>
											{item.en}
										</span>
									</button>
								))}
							</div>
						</div>
					))}
				</nav>

				<div className="pt-8">
					<button
						onClick={handleSaveConfig}
						disabled={isSaving}
						className={`flex items-center justify-center gap-3 w-full py-4 transition-all shadow-xl shadow-black/10 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold ${
							isSaving
								? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-wait"
								: "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:scale-[1.02] active:scale-[0.98]"
						}`}
					>
						{isSaving ? (
							<Loader2 size={14} className="animate-spin" />
						) : (
							<Check size={14} />
						)}
						{isSaving ? "正在保存..." : "保存当前更改"}
					</button>
				</div>
			</aside>

			{/* Right Content Area (Dynamic Content) */}
			<div className="flex-1 lg:pl-12">
				<div
					key={activeSection}
					className="animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both"
				>
					{isLoading ? (
						<SectionSkeleton />
					) : (
						<>
							{activeSection === "ai" && (
								<AiProviderSection
									value={config.ai || DEFAULT_CONFIG.ai!}
									onChange={(aiConfig) =>
										setConfig({ ...config, ai: aiConfig })
									}
									testAiConnection={testAiConnection}
								/>
							)}
							{activeSection === "email" && (
								<EmailServiceSection
									value={config.email || DEFAULT_CONFIG.email!}
									onChange={(emailConfig) =>
										setConfig({ ...config, email: emailConfig })
									}
									testEmailConnection={testEmailConnection}
								/>
							)}
							{activeSection === "maintenance" && <MaintenanceSection />}
						</>
					)}
				</div>
			</div>

			{/* Mobile Save Button */}
			<div className="lg:hidden fixed bottom-10 right-10 z-40">
				<button
					onClick={handleSaveConfig}
					disabled={isSaving}
					className={`flex items-center gap-3 px-10 py-5 rounded-full shadow-2xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] font-bold ${
						isSaving
							? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-wait"
							: "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
					}`}
				>
					{isSaving ? (
						<Loader2 size={14} className="animate-spin" />
					) : (
						<Check size={14} />
					)}
					{isSaving ? "正在保存" : "保存"}
				</button>
			</div>
		</div>
	);
}
