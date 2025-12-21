import { AiProviderSection } from "@/components/admin/settings/ai-provider-section";
import { EmailServiceSection } from "@/components/admin/settings/email-service-section";
import { MaintenanceSection } from "@/components/admin/settings/maintenance-section";
import TechButton from "@/components/ui/tech-button";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Terminal } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSaveConfig = () => {
    // TODO: 添加实际的写入逻辑
    const promise = new Promise((resolve) => setTimeout(resolve, 1200));
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
        {/* AI Provider Config Module */}
        <AiProviderSection />

        {/* Email Service Config Module */}
        <EmailServiceSection />
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
