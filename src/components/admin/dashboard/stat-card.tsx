interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-6 space-y-4 relative overflow-hidden group hover:border-zinc-200 dark:hover:border-white/10 transition-all duration-500 rounded-sm">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-medium uppercase text-zinc-400 tracking-[0.2em]">
          {label}
        </span>
        <div className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-500">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-4xl font-serif font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
          {trend}
        </div>
      </div>
    </div>
  );
}
