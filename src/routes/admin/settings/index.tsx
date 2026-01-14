import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SystemConfig } from "@/features/config/config.schema";
import { EmailServiceSection } from "@/features/email/components/email-service-section";
import { MaintenanceSection } from "@/features/config/components/maintenance-section";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { useEmailConnection } from "@/features/email/hooks/use-email-connection";
import { SectionSkeleton } from "@/features/config/components/settings-skeleton";
import { UmamiSection } from "@/features/config/components/umami-section";
import { Button } from "@/components/ui/button";
import { DEFAULT_CONFIG } from "@/features/config/config.schema";

export const Route = createFileRoute("/admin/settings/")({
  component: RouteComponent,
  loader: () => ({
    title: "设置",
  }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
    ],
  }),
});

function RouteComponent() {
  const { settings, saveSettings, isLoading } = useSystemSetting();
  const { testEmailConnection } = useEmailConnection();
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

  // 同步 settings 到本地 config 状态
  useEffect(() => {
    if (settings) {
      setConfig(settings);
    }
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await saveSettings({ data: config });
      toast.success("系统配置已生效");
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">
        <SectionSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 space-y-16 pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/40">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
            系统设置
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
            系统配置和维护
          </p>
        </div>

        <Button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className={`h-11 px-8 transition-all rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg shadow-primary/5 ${
            isSaving ? "opacity-80" : "hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin mr-2" />
          ) : (
            <Check size={14} className="mr-2" />
          )}
          {isSaving ? "同步配置..." : "保存更改"}
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              服务配置
            </span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          <EmailServiceSection
            value={config.email || DEFAULT_CONFIG.email!}
            onChange={(emailConfig) =>
              setConfig({ ...config, email: emailConfig })
            }
            testEmailConnection={testEmailConnection}
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              统计服务
            </span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          <UmamiSection
            value={config.umami || { websiteId: "", src: "", apiKey: "" }}
            onChange={(umamiConfig) =>
              setConfig({ ...config, umami: umamiConfig })
            }
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              系统维护
            </span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>
          <MaintenanceSection />
        </section>
      </div>

      {/* Mobile Sticky Save Button */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-40">
        <Button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className={`w-full h-14 rounded-sm shadow-xl transition-all text-[11px] uppercase tracking-[0.2em] font-bold ${
            isSaving
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin mr-2" />
          ) : (
            <Check size={14} className="mr-2" />
          )}
          {isSaving ? "正在保存..." : "保存系统配置"}
        </Button>
      </div>
    </div>
  );
}
