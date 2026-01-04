import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:border-foreground/20 transition-all duration-500">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-[0.2em]">
            {label}
          </span>
          <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-500">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-serif font-medium tracking-tight">
            {value}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground tracking-wider">
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
