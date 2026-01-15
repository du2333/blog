import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SystemConfig } from "@/features/config/config.schema";
import {
  DEFAULT_CONFIG,
  SystemConfigSchema,
} from "@/features/config/config.schema";
import { EmailServiceSection } from "@/features/email/components/email-service-section";
import { MaintenanceSection } from "@/features/config/components/maintenance-section";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { useEmailConnection } from "@/features/email/hooks/use-email-connection";
import { SectionSkeleton } from "@/features/config/components/settings-skeleton";
import { UmamiSection } from "@/features/config/components/umami-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const methods = useForm<SystemConfig>({
    resolver: zodResolver(SystemConfigSchema),
    defaultValues: DEFAULT_CONFIG,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  // 同步 settings 到 form
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: SystemConfig) => {
    try {
      await saveSettings({ data });
      toast.success("系统配置已生效");
      // Reset dirty state with new values
      reset(data);
    } catch {
      toast.error("保存失败，请重试");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <SectionSkeleton />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-12"
      >
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">
              系统设置
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              管理系统配置与参数
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={`h-10 px-6 transition-all rounded-sm text-[11px] uppercase tracking-[0.15em] font-bold shadow-sm ${
              isSubmitting
                ? "opacity-80"
                : "hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Check size={14} className="mr-2" />
            )}
            {isSubmitting ? "同步中..." : "保存更改"}
          </Button>
        </div>

        {/* Main Content with Tabs */}
        <Tabs
          defaultValue="service"
          className="flex flex-col md:grid md:grid-cols-[200px_1fr] gap-12 lg:gap-20 items-start animate-in fade-in duration-1000 delay-100 fill-mode-both"
        >
          <TabsList className="flex flex-row md:flex-col h-auto bg-transparent p-0 gap-1 md:w-full overflow-x-auto md:overflow-visible justify-start">
            <TabsTrigger
              value="service"
              className="w-full md:justify-start justify-center px-4 py-3 rounded-md text-muted-foreground data-[state=active]:bg-muted/50 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none transition-all duration-200 border border-transparent data-[state=active]:border-border/40"
            >
              服务配置
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="w-full md:justify-start justify-center px-4 py-3 rounded-md text-muted-foreground data-[state=active]:bg-muted/50 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none transition-all duration-200 border border-transparent data-[state=active]:border-border/40"
            >
              统计分析
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="w-full md:justify-start justify-center px-4 py-3 rounded-md text-muted-foreground data-[state=active]:bg-muted/50 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none transition-all duration-200 border border-transparent data-[state=active]:border-border/40"
            >
              系统维护
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent
              value="service"
              className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            >
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-medium tracking-tight">服务连接</h2>
                <p className="text-sm text-muted-foreground">
                  配置邮件发送服务及其他第三方集成
                </p>
              </div>
              <EmailServiceSection testEmailConnection={testEmailConnection} />
            </TabsContent>

            <TabsContent
              value="analytics"
              className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 fill-mode-both"
            >
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-medium tracking-tight">流量统计</h2>
                <p className="text-sm text-muted-foreground">
                  集成 Umami 等隐私友好的统计工具
                </p>
              </div>
              <UmamiSection />
            </TabsContent>

            <TabsContent
              value="maintenance"
              className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            >
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-medium tracking-tight">数据维护</h2>
                <p className="text-sm text-muted-foreground">
                  缓存管理、索引重建及系统健康检查
                </p>
              </div>
              <MaintenanceSection />
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </FormProvider>
  );
}
