import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, Database, FileText, MessageSquare } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStatsQuery } from "@/features/dashboard/dashboard.query";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";

export const Route = createFileRoute("/admin/")({
  component: DashboardOverview,
  pendingComponent: DashboardSkeleton,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(dashboardStatsQuery());

    return {
      title: "概览",
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
    ],
  }),
});

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatTimeAgo(date: Date | null | string) {
  if (!date) return "";
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000,
  );

  if (diffInSeconds < 60) return "刚刚";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} 分钟前`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} 小时前`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} 天前`;
}

function DashboardOverview() {
  const { data } = useSuspenseQuery(dashboardStatsQuery());
  const { stats, activities } = data;

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
            color="zinc"
          />
        </Link>
        <Link to="/admin/posts" search={{ status: "PUBLISHED" }}>
          <StatCard
            label="已发布文章"
            value={stats.publishedPosts.toString()}
            icon={<FileText size={18} strokeWidth={1.5} />}
            trend="活跃内容"
            color="zinc"
          />
        </Link>
        <StatCard
          label="媒体库占用"
          value={formatBytes(stats.mediaSize)}
          icon={<Database size={18} strokeWidth={1.5} />}
          trend="存储使用"
          color="zinc"
        />
        <Link to="/admin/posts" search={{ status: "DRAFT" }}>
          <StatCard
            label="草稿箱"
            value={stats.drafts.toString()}
            icon={<Activity size={18} strokeWidth={1.5} />}
            trend="未完成的工作"
            color="zinc"
          />
        </Link>
      </div>

      {/* Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Graph */}
        <Card className="lg:col-span-2 border-none! bg-transparent! shadow-none!">
          <CardHeader className="flex flex-row justify-between items-baseline border-b border-border/50 pb-4 px-0">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.2em]">
              流量趋势
            </CardTitle>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
              24小时流量分析
            </span>
          </CardHeader>

          <CardContent className="px-0 pt-10 space-y-6">
            <div className="h-72 w-full flex items-end gap-1.5 md:gap-3 group/chart relative">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-accent hover:bg-primary transition-all duration-500 relative group/bar rounded-t-[1px]"
                  style={{ height: `${Math.random() * 70 + 10}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] py-1 px-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none rounded-sm">
                    {Math.floor(Math.random() * 100)}
                  </div>
                </div>
              ))}

              {/* Minimal Background Grid */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-border/30 w-full"></div>
                <div className="border-t border-border/30 w-full"></div>
                <div className="border-t border-border/30 w-full"></div>
                <div className="h-0"></div>
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono uppercase tracking-[0.3em]">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
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
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
              {activities.length > 0 ? (
                activities.map((log, i) => {
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
  );
}
