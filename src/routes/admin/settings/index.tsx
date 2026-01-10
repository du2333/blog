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
import { Button } from "@/components/ui/button";
import { DEFAULT_CONFIG } from "@/features/config/config.schema";

export const Route = createFileRoute("/admin/settings/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "设置",
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

  const [activeSection, setActiveSection] = useState<"email" | "maintenance">(
    "email",
  );

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

  const navGroups = [
    {
      label: "服务配置",
      items: [{ id: "email" as const, label: "邮件服务" }],
    },
    {
      label: "系统管理",
      items: [{ id: "maintenance" as const, label: "系统维护" }],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-24 max-w-7xl mx-auto min-h-[calc(100vh-200px)] px-8 md:px-16 lg:px-24 pt-24 lg:pt-40">
      {/* Left Sticky Navigation */}
      <aside className="lg:w-80 shrink-0 lg:sticky lg:top-40 h-fit space-y-20 animate-in fade-in slide-in-from-left-4 duration-1000 fill-mode-both">
        <div className="space-y-3">
          <h1 className="text-6xl font-serif font-medium tracking-tighter leading-none text-foreground">
            设置
          </h1>
          <p className="text-[11px] tracking-[0.5em] text-muted-foreground font-bold opacity-60">
            系统偏好设置
          </p>
        </div>

        <nav className="space-y-16">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-8">
              <div className="h-px flex-1 bg-border/50"></div>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group flex flex-col items-start py-4 px-5 -mx-5 rounded-sm transition-all ${
                      activeSection === item.id
                        ? "bg-accent shadow-sm"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <span
                      className={`text-[12px] tracking-[0.25em] font-bold transition-colors ${
                        activeSection === item.id
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {item.label}
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
                ? "bg-muted text-muted-foreground cursor-wait"
                : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
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
        <Button
          onClick={handleSaveConfig}
          disabled={isSaving}
          size="lg"
          className={`flex items-center gap-3 px-10 h-16 rounded-sm shadow-2xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] font-bold ${
            isSaving
              ? "bg-muted text-muted-foreground cursor-wait"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {isSaving ? "正在保存" : "保存"}
        </Button>
      </div>
    </div>
  );
}
