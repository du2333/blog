import { useNavigate } from "@tanstack/react-router";

export function NotFound() {
  const navigate = useNavigate();
  const onReturn = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 text-center bg-background">
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/60">
            [ 404 ]
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight text-foreground">
            找不到该页面
          </h2>
          <p className="max-w-md mx-auto text-sm text-muted-foreground/70 font-light leading-relaxed">
            您请求的内容可能已被移除或地址输入有误。
          </p>
        </div>

        <button
          onClick={onReturn}
          className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          [ 返回主页 ]
        </button>
      </div>
    </div>
  );
}
