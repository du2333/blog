import { Eye, EyeOff, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { SystemConfig } from "@/features/config/config.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UmamiSection() {
  const [showKey, setShowKey] = useState(false);
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SystemConfig>();

  // Determine default tab based on config presence
  const apiKey = watch("umami.apiKey");
  const defaultTab = apiKey ? "cloud" : "self-hosted";

  return (
    <div className="space-y-16">
      <div className="space-y-16">
        {/* Basic Config */}
        <section className="space-y-8">
          <header className="flex items-center gap-3">
            <Globe size={14} className="text-muted-foreground" />
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
              基础配置
            </h5>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pl-6">
            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                服务地址
              </label>
              <Input
                {...register("umami.src")}
                placeholder="https://analytics.example.com (留空禁用)"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
              {errors.umami?.src && (
                <p className="text-[10px] text-red-500">
                  {errors.umami.src.message}
                </p>
              )}
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                Website ID
              </label>
              <Input
                {...register("umami.websiteId")}
                placeholder="xxxxxxxx-xxxx-xxxx (留空禁用)"
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
              />
              {errors.umami?.websiteId && (
                <p className="text-[10px] text-red-500">
                  {errors.umami.websiteId.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Auth Section */}
        <section className="space-y-8 pt-6 border-t border-border/40">
          <header className="flex items-center gap-3">
            <Lock size={14} className="text-muted-foreground" />
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
              访问凭证
            </h5>
          </header>

          <Tabs defaultValue={defaultTab} className="w-full pl-6">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
              <TabsTrigger value="cloud">云服务 / v2</TabsTrigger>
              <TabsTrigger value="self-hosted">自托管</TabsTrigger>
            </TabsList>

            <TabsContent
              value="cloud"
              className="space-y-10 animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-3 group max-w-2xl">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                    API Key
                  </label>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Input
                        type={showKey ? "text" : "password"}
                        {...register("umami.apiKey")}
                        placeholder="可选，用于获取后台实时统计数据"
                        className="w-full bg-transparent border-none shadow-none text-sm font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/20 pr-10 h-auto"
                      />
                      <Button
                        type="button"
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
                  {errors.umami?.apiKey && (
                    <p className="text-[10px] text-red-500">
                      {errors.umami.apiKey.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="self-hosted"
              className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-3 group">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                    用户名
                  </label>
                  <Input
                    {...register("umami.username")}
                    placeholder="admin"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
                  />
                  {errors.umami?.username && (
                    <p className="text-[10px] text-red-500">
                      {errors.umami.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 group">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground group-focus-within:text-foreground transition-colors">
                    密码
                  </label>
                  <Input
                    type="password"
                    {...register("umami.password")}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-3 text-sm font-sans focus-visible:ring-0 focus:border-foreground transition-all px-0"
                  />
                  {errors.umami?.password && (
                    <p className="text-[10px] text-red-500">
                      {errors.umami.password.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
