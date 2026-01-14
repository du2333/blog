import { BarChart, Eye, EyeOff, Globe, Info, Lock } from "lucide-react";
import { useState } from "react";
import type { SystemConfig } from "@/features/config/config.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UmamiSectionProps {
  value: Partial<NonNullable<SystemConfig["umami"]>>;
  onChange: (cfg: NonNullable<SystemConfig["umami"]>) => void;
}

export function UmamiSection({ value, onChange }: UmamiSectionProps) {
  const [showKey, setShowKey] = useState(false);

  // Helper to safely update
  const update = (updates: Partial<NonNullable<SystemConfig["umami"]>>) => {
    // We cast to NonNullable because we are building a valid object
    onChange({ ...value, ...updates } as NonNullable<SystemConfig["umami"]>);
  };

  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-border/50 pb-10">
        <div className="space-y-1.5">
          <h3 className="text-4xl font-serif font-medium tracking-tight text-foreground">
            Umami 统计
          </h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold opacity-80">
            网站流量统计与分析
          </p>
        </div>
        <div className="p-2 bg-muted rounded-full">
          <BarChart size={20} className="text-muted-foreground" />
        </div>
      </div>

      {/* Service Notice Box */}
      <div className="bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800/30 rounded-lg p-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3 mb-4 text-zinc-600/80 dark:text-zinc-400/80">
          <Info size={16} />
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium">
            配置说明
          </h4>
        </div>
        <ul className="space-y-3">
          {[
            "配置 Umami 服务地址和 Website ID 以启用流量统计功能。",
            "Cloud 版本请使用 API Key；自部署版本请使用 Username / Password。",
            "脚本地址 (Script URL) 将自动注入到所有页面中。",
          ].map((text, i) => (
            <li key={i} className="flex gap-3 group">
              <span className="text-[8px] mt-1.5 text-zinc-400 dark:text-zinc-600">
                □
              </span>
              <p className="text-xs font-sans text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-16">
        {/* Basic Config */}
        <section className="space-y-10">
          <header className="flex items-center gap-3">
            <Globe size={14} className="text-muted-foreground" />
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
              基础配置
            </h5>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pl-6">
            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                服务地址 (Endpoint)
              </label>
              <Input
                value={value.src || ""}
                onChange={(e) => update({ src: e.target.value })}
                placeholder="https://analytics.example.com"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                Website ID
              </label>
              <Input
                value={value.websiteId || ""}
                onChange={(e) => update({ websiteId: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
            </div>
          </div>
        </section>

        {/* Auth Section */}
        <section className="space-y-10 pt-6 border-t border-border/40">
          <header className="flex items-center gap-3">
            <Lock size={14} className="text-muted-foreground" />
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
              访问凭证 (Authentication)
            </h5>
          </header>

          <Tabs
            defaultValue={value.apiKey ? "cloud" : "self-hosted"}
            className="w-full pl-6"
          >
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
              <TabsTrigger value="cloud">云服务 / v2 (API Key)</TabsTrigger>
              <TabsTrigger value="self-hosted">自托管 (账号密码)</TabsTrigger>
            </TabsList>

            <TabsContent value="cloud" className="space-y-10">
              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-3 group max-w-2xl">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                    API Key
                  </label>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Input
                        type={showKey ? "text" : "password"}
                        value={value.apiKey || ""}
                        placeholder="可选，用于获取后台实时统计数据"
                        onChange={(e) => update({ apiKey: e.target.value })}
                        className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/20 pr-10 h-auto"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-colors h-8 w-8 rounded-sm"
                      >
                        {showKey ? (
                          <EyeOff size={16} strokeWidth={1.5} />
                        ) : (
                          <Eye size={16} strokeWidth={1.5} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="self-hosted" className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-3 group">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                    用户名 (Username)
                  </label>
                  <Input
                    value={value.username || ""}
                    onChange={(e) => update({ username: e.target.value })}
                    placeholder="admin"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
                  />
                </div>

                <div className="space-y-3 group">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                    密码 (Password)
                  </label>
                  <Input
                    type="password"
                    value={value.password || ""}
                    onChange={(e) => update({ password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
