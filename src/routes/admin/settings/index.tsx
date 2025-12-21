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
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight">系统设置</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-mono">
            Global Configuration // System Protocols
          </p>
        </div>
        <button
          onClick={handleSaveConfig}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.2em] font-medium hover:scale-105 transition-all active:scale-95"
        >
          <Check size={14} />
          保存更改
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
        <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
          <div className="flex items-center gap-2">
            <Info size={12} strokeWidth={1.5} />
            <span>Kernel: v3.1.2-CMS</span>
          </div>
          <div className="hidden sm:block opacity-20">/</div>
          <div className="hidden sm:flex items-center gap-2">
            <span>Server Uptime: 1,244h</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 font-bold">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
