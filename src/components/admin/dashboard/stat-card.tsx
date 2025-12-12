interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  const colors: Record<string, string> = {
    cyan: "border-zzz-cyan text-zzz-cyan",
    lime: "border-zzz-lime text-zzz-lime",
    orange: "border-zzz-orange text-zzz-orange",
    red: "border-red-500 text-red-500",
  };

  return (
    <div
      className={`bg-zzz-dark border-l-4 p-5 shadow-lg relative overflow-hidden group hover:bg-white/5 transition-colors ${
        colors[color].split(" ")[0]
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div
        className={`text-xs font-bold font-mono ${colors[color].split(" ")[1]}`}
      >
        {trend}
      </div>

      {/* Deco */}
      <div className="absolute -bottom-4 -right-4 text-[6rem] opacity-5 font-black text-white pointer-events-none select-none">
        {value.charAt(0)}
      </div>
    </div>
  );
}
