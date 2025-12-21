import { AiProviderSection } from "@/components/admin/settings/ai-provider-section";
import { EmailServiceSection } from "@/components/admin/settings/email-service-section";
import { MaintenanceSection } from "@/components/admin/settings/maintenance-section";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Info } from "lucide-react";
import { toast } from "sonner";
import { useSystemSetting } from "@/components/admin/settings/use-system-setting";
import { SystemConfig, DEFAULT_CONFIG } from "@/features/config/config.schema";
import { useState, useEffect } from "react";
import { SectionSkeleton } from "@/components/skeletons/settings-skeleton";

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

  const handleSaveConfig = () => {
    const promise = saveSettings({ data: config });
    toast.promise(promise, {
      loading: "正在保存系统配置...",
      success: "系统配置已生效",
      error: "保存失败，请重试",
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
            <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800"></span>
            系统配置
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">System Settings</h1>
        </div>
        <button
          onClick={handleSaveConfig}
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] uppercase tracking-[0.3em] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-xl shadow-black/10"
        >
          <Check size={14} strokeWidth={3} />
          同步配置
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {isLoading ? (
          <>
            <SectionSkeleton />
            <SectionSkeleton />
          </>
        ) : (
          <>
            {/* AI Provider Config Module */}
            <AiProviderSection
              value={config.ai || DEFAULT_CONFIG.ai!}
              onChange={(aiConfig) => setConfig({ ...config, ai: aiConfig })}
              testAiConnection={testAiConnection}
            />

            {/* Email Service Config Module */}
            <EmailServiceSection
              value={config.email || DEFAULT_CONFIG.email!}
              onChange={(emailConfig) =>
                setConfig({ ...config, email: emailConfig })
              }
              testEmailConnection={testEmailConnection}
            />
          </>
        )}
      </div>

      {/* Data Maintenance Module */}
      <MaintenanceSection />

      {/* System Footer Info */}
      <div className="pt-12 border-t border-zinc-100 dark:border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <Info size={12} strokeWidth={1.5} />
              <span>Version 3.1.2</span>
            </div>
            <div className="hidden sm:block opacity-20">/</div>
            <div className="hidden sm:flex items-center gap-2 text-zinc-300 dark:text-zinc-700">
              <span>All Systems Operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            已连接至安全节点
          </div>
        </div>
      </div>
    </div>
  );
}
