import { useMemo } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Database,
  ExternalLink,
  Eye,
  FileText,
  MessageSquare,
  Minus,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { z } from "zod";
import type {
  ActivityLogItem,
  DashboardRange,
  TrafficData,
} from "@/features/dashboard/dashboard.schema";
import { dashboardStatsQuery } from "@/features/dashboard/queries";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from "@/components/ui/tooltip";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatBytes, formatTimeAgo } from "@/lib/utils";
import { refreshDashboardCacheFn } from "@/features/dashboard/dashboard.api";

const SearchSchema = z.object({
  range: z.enum(["24h", "7d", "30d", "90d"]).default("24h").optional(),
});

export const Route = createFileRoute("/admin/")({
  component: DashboardOverview,
  pendingComponent: DashboardSkeleton,
  validateSearch: (search) => SearchSchema.parse(search),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(dashboardStatsQuery);
    return { title: "概览" };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
    ],
  }),
});

function DashboardOverview() {
  const { range = "24h" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const { data, isFetching } = useSuspenseQuery(dashboardStatsQuery);
  const { stats, activities, trafficByRange, umamiUrl } = data;
  const refreshDashboardCacheMutation = useMutation({
    mutationFn: refreshDashboardCacheFn,
    onSuccess: () => {
      queryClient.invalidateQueries(dashboardStatsQuery);
    },
  });

  // Get current range data
  // Get current range data
  const currentRangeData = trafficByRange?.[range];
  const traffic = currentRangeData?.traffic;
  const overview = currentRangeData?.overview;
  const topPages = currentRangeData?.topPages;
  const lastUpdated = currentRangeData?.lastUpdated;

  const lastUpdatedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const rangeLabel = {
    "24h": "24小时",
    "7d": "7天",
    "30d": "30天",
    "90d": "90天",
  };

  const axisLabels = useMemo(() => {
    switch (range) {
      case "7d":
        return ["7天前", "3天前", "现在"];
      case "30d":
        return ["30天前", "15天前", "现在"];
      case "90d":
        return ["90天前", "45天前", "现在"];
      default:
        return ["24小时", "12小时", "现在"];
    }
  }, [range]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-foreground">
            概览
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground">
            系统运行状况概览
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/comments" search={{ status: "pending" }}>
          <StatCard
            label="待审核评论"
            value={stats.pendingComments.toString()}
            icon={<MessageSquare size={18} strokeWidth={1.5} />}
            trend="需要处理"
          />
        </Link>
        <Link to="/admin/posts" search={{ status: "PUBLISHED" }}>
          <StatCard
            label="已发布文章"
            value={stats.publishedPosts.toString()}
            icon={<FileText size={18} strokeWidth={1.5} />}
            trend="活跃内容"
          />
        </Link>
        <StatCard
          label="媒体库占用"
          value={formatBytes(stats.mediaSize)}
          icon={<Database size={18} strokeWidth={1.5} />}
          trend="存储使用"
        />
        <Link to="/admin/posts" search={{ status: "DRAFT" }}>
          <StatCard
            label="草稿箱"
            value={stats.drafts.toString()}
            icon={<Activity size={18} strokeWidth={1.5} />}
            trend="未完成的工作"
          />
        </Link>
      </div>

      {/* Traffic & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Traffic Analysis (Chart + Metrics) */}
        <Card className="lg:col-span-2 border-none! bg-transparent! shadow-none!">
          <CardHeader className="flex flex-row justify-between items-center border-b border-border/50 pb-4 px-0">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-medium uppercase tracking-[0.2em]">
                流量趋势
              </CardTitle>
              {umamiUrl && (
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={umamiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>查看详细统计</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Tabs
                value={range}
                onValueChange={(val) =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      range: val as DashboardRange,
                    }),
                  })
                }
                className="h-6"
              >
                <TabsList className="h-6 p-0 bg-transparent gap-2">
                  {Object.entries(rangeLabel).map(([key, label]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="text-[9px] px-2 py-0.5 h-full data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-sm transition-all text-muted-foreground"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => refreshDashboardCacheMutation.mutate({})}
                      disabled={isFetching}
                      className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        size={12}
                        className={isFetching ? "animate-spin" : ""}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>刷新数据</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
              {lastUpdated && (
                <span className="text-[9px] text-muted-foreground/60 font-mono border-l border-border/50 pl-4">
                  最后更新于 {lastUpdatedTime}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-8 pb-4 space-y-8">
            {/* Detailed Metrics Grid */}
            {overview && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricItem
                  label="访客数"
                  value={overview.visitors.value}
                  prev={overview.visitors.prev}
                  icon={<Users size={14} />}
                />
                <MetricItem
                  label="浏览量"
                  value={overview.pageViews.value}
                  prev={overview.pageViews.prev}
                  icon={<Eye size={14} />}
                />
                <MetricItem
                  label="总访问"
                  value={overview.visits.value}
                  prev={overview.visits.prev}
                  icon={<MousePointerClick size={14} />}
                />
                <MetricItem
                  label="跳出率"
                  value={overview.bounces.value}
                  prev={overview.bounces.prev}
                  total={overview.visits.value} // Calculate rate: bounces / visits
                  format="percent"
                  icon={<Activity size={14} />}
                />
              </div>
            )}

            <div className="h-64 w-full relative group/chart">
              {/* traffic logic */}
              {!umamiUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="bg-muted/50 p-3 rounded-full">
                    <Activity className="opacity-40" size={24} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      未配置统计服务
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      请通过环境变量配置 Umami
                    </p>
                  </div>
                </div>
              ) : traffic && traffic.length > 0 ? (
                <div className="w-full h-full">
                  <TrafficChart data={traffic} />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                  <Activity className="opacity-20" size={32} />
                  <p>暂无流量数据</p>
                </div>
              )}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono uppercase tracking-[0.3em] mt-2 px-1 opacity-60">
              <span>{axisLabels[0]}</span>
              <span>{axisLabels[1]}</span>
              <span>{axisLabels[2]}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Top Pages & Activity Log */}
        <div className="space-y-10">
          {/* Top Pages */}
          <Card className="border-none! bg-transparent! shadow-none!">
            <CardHeader className="flex flex-row justify-between items-baseline border-b border-border/50 pb-4 px-0">
              <CardTitle className="text-sm font-medium uppercase tracking-[0.2em]">
                热门文章
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <div className="space-y-4">
                {topPages && topPages.length > 0 ? (
                  topPages.slice(0, 5).map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-4">
                        <div className="text-xs font-medium truncate text-foreground/90 group-hover:text-primary transition-colors">
                          {page.x}
                        </div>
                        <div className="w-full bg-muted/30 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-primary/50 h-full rounded-full"
                            style={{
                              width: `${(page.y / Math.max(...topPages.map((p) => p.y))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground shrink-0 w-12 text-right">
                        {page.y}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">暂无数据</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="border-none! bg-transparent! shadow-none!">
            <CardHeader className="flex flex-row justify-between items-baseline border-b border-border/50 pb-4 px-0">
              <CardTitle className="text-sm font-medium uppercase tracking-[0.2em]">
                系统日志
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-4">
                {activities.length > 0 ? (
                  activities.map((log: ActivityLogItem, i: number) => {
                    const content = (
                      <div className="flex gap-4 p-3 rounded-lg group-hover/item:bg-muted/50 transition-all duration-300 relative overflow-hidden">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            log.type === "comment"
                              ? "bg-amber-500"
                              : log.type === "post"
                                ? "bg-green-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="space-y-1">
                          <p className="text-xs font-light leading-snug group-hover/item:text-foreground transition-colors pr-6 text-muted-foreground/90">
                            {log.text}
                          </p>
                          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                            {formatTimeAgo(log.time)}
                          </p>
                        </div>
                        {log.link && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-300">
                            <Activity size={14} />
                          </div>
                        )}
                      </div>
                    );

                    if (log.link) {
                      return (
                        <Link
                          key={i}
                          to={log.link}
                          className="block group/item transition-all"
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div key={i} className="group/item">
                        {content}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-muted-foreground">暂无活动</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  prev,
  total,
  format = "number",
  icon,
}: {
  label: string;
  value: number;
  prev?: number;
  total?: number;
  format?: "number" | "percent" | "time";
  icon?: React.ReactNode;
}) {
  const displayValue = useMemo(() => {
    if (format === "percent") {
      // If total provided, calculate rate: value / total
      const rate = total ? (value / total) * 100 : value;
      return `${rate.toFixed(1)}%`;
    }
    // format large numbers
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  }, [value, total, format]);

  const trend = useMemo(() => {
    if (prev === undefined || prev === 0) return null;
    // If format is percent (bounce rate), calculate diff relative to prev rate?
    // Actually simplicity: if prev is raw count, we need prev total to calc prev rate.
    // Assuming prev is same unit as value.
    const diff = value - prev;
    const percent = (diff / prev) * 100;
    return {
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
      percent: Math.abs(percent).toFixed(0),
    };
  }, [value, prev]);

  return (
    <div className="bg-background/40 border border-border/50 rounded-lg p-3 flex flex-col justify-between group hover:border-border/80 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </div>
      <div>
        <div className="text-lg font-serif font-medium tracking-tight">
          {displayValue}
        </div>
        {trend && (
          <div
            className={cn(
              "text-[9px] flex items-center gap-0.5 mt-1 font-medium",
              trend.direction === "up"
                ? "text-emerald-500"
                : trend.direction === "down"
                  ? "text-rose-500"
                  : "text-muted-foreground",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUp size={10} />
            ) : trend.direction === "down" ? (
              <ArrowDown size={10} />
            ) : (
              <Minus size={10} />
            )}
            <span>{trend.percent}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background/5 border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors",
        className,
      )}
    >
      <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity">
        {icon}
      </div>
      <div className="space-y-2 relative z-10">
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {label}
        </div>
        <div className="text-3xl font-serif font-medium tracking-tight">
          {value}
        </div>
        {trend && <div className="text-xs text-muted-foreground">{trend}</div>}
      </div>
    </div>
  );
}

function TrafficChart({ data }: { data: Array<TrafficData> }) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--muted-foreground)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--muted-foreground)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload.length) {
                const point = payload[0].payload as TrafficData;
                return (
                  <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl p-3 text-xs">
                    <div className="text-muted-foreground mb-1 font-mono">
                      {new Date(point.date).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {point.views} 访问
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
            cursor={{
              stroke: "var(--muted-foreground)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
              opacity: 0.5,
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorViews)"
            isAnimationActive={true}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
