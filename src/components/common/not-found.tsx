import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function NotFound() {
  const navigate = useNavigate();
  const onReturn = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden p-6 text-center bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-2">
          <h1 className="text-[120px] md:text-[200px] font-serif font-medium leading-none tracking-tighter text-zinc-900 dark:text-zinc-100 opacity-10">
            404
          </h1>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight">
              找不到该页面
            </h2>
            <p className="max-w-md mx-auto text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              您请求的内容可能已被移除或地址输入有误。
            </p>
          </div>
        </div>

        <button
          onClick={onReturn}
          className="group inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] font-medium transition-all"
        >
          <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-500">
            <ArrowLeft size={18} />
          </div>
          <span className="border-b border-transparent group-hover:border-current transition-all">返回主页</span>
        </button>
      </div>

      <footer className="absolute bottom-12 left-0 w-full text-center px-6">
        <div className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.6em]">
          End of Line // Error 404
        </div>
      </footer>
    </div>
  );
}
