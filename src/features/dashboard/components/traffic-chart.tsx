import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { TrafficData } from "@/features/dashboard/dashboard.schema";

export function TrafficChart({ data }: { data: Array<TrafficData> }) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(var(--foreground))"
                stopOpacity={0.1}
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--foreground))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload.length) {
                const point = payload[0].payload as TrafficData;
                return (
                  <div className="bg-background border border-border/50 p-3 text-xs shadow-none">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                      {new Date(point.date).toLocaleDateString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-serif font-medium text-foreground">
                        {point.views}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        浏览量
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
            cursor={{
              stroke: "hsl(var(--border))",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--foreground))"
            strokeWidth={1.5}
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
