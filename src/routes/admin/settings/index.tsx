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
    <div className="flex flex-col lg:flex-row gap-20 max-w-7xl mx-auto min-h-[calc(100vh-200px)] px-6 md:px-12 lg:px-16 pt-24 lg:pt-36">
      {/* Left Sticky Navigation */}
      <aside className="lg:w-72 shrink-0 lg:sticky lg:top-36 h-fit space-y-16 animate-in fade-in slide-in-from-left-4 duration-1000">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif font-medium tracking-tight text-foreground">
            系统设置
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 font-bold">
            系统维护和配置
          </p>
        </div>

        <nav className="space-y-12">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-foreground/70">
                  {group.label}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full group text-left px-6 py-4 rounded-sm transition-all duration-500 relative ${
                      activeSection === section.id
                        ? "bg-foreground text-background"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                        {section.label}
                      </span>
                      <div
                        className={`w-1 h-1 rounded-full transition-all duration-700 ${
                          activeSection === section.id
                            ? "bg-background scale-100"
                            : "bg-foreground scale-0 group-hover:scale-100"
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="pt-4">
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className={`h-12 w-full transition-all rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold shadow-xl shadow-primary/5 ${
              isSaving ? "opacity-50" : "hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Check size={14} className="mr-2" />
            )}
            {isSaving ? "同步中..." : "保存配置"}
          </Button>
        </div>
      </aside>

      {/* Right Content Area (Dynamic Content) */}
      <div className="flex-1 lg:pl-16">
        <div
          key={activeSection}
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
        >
          {isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-8 md:p-12">
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
            </div>
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
