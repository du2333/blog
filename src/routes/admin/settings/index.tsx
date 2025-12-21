import { AiProviderSection } from "@/components/admin/settings/ai-provider-section";
import { EmailServiceSection } from "@/components/admin/settings/email-service-section";
import { MaintenanceSection } from "@/components/admin/settings/maintenance-section";
import TechButton from "@/components/ui/tech-button";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Terminal } from "lucide-react";
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
      loading: "正在写入固件...",
      success: "系统配置已永久生效",
      error: "写入冲突",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl">
      <div className="flex justify-between items-end border-b border-zzz-gray pb-4">
        <div>
          <h1 className="text-3xl font-black font-sans uppercase text-white italic">
            System <span className="text-zzz-cyan">Config</span>
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-1">
            GLOBAL_SETTINGS // MAINTENANCE_PROTOCOLS
          </p>
        </div>
        <TechButton onClick={handleSaveConfig} icon={<Check size={16} />}>
          保存更改
        </TechButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-700 uppercase tracking-[0.3em] pt-12">
        <Terminal size={12} />
        <span>Kernel_Version: 3.1.2-ZZZ</span>
        <span>//</span>
        <span>Uptime: 1,244h</span>
        <span>//</span>
        <span className="text-zzz-lime animate-pulse">All Systems Nominal</span>
      </div>
    </div>
  );
}
