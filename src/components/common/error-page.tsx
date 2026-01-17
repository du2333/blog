import { useRouter } from "@tanstack/react-router";

export function ErrorPage({ error: _error }: { error?: Error }) {
  const router = useRouter();
  const onReset = () => {
    router.invalidate();
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 md:p-8">
      <div className="w-full max-w-xl flex flex-col items-center text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/60">
            [ ERROR ]
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">
            程序发生错误
          </h2>
          <p className="text-sm text-muted-foreground/70 font-light leading-relaxed max-w-md mx-auto">
            执行过程中遇到了意外情况，您可以尝试刷新或重试。
          </p>
        </div>

        <button
          onClick={onReset}
          className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          [ 重试 ]
        </button>
      </div>
    </div>
  );
}
