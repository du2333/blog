export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#050505] py-20 mt-32 transition-colors duration-500">
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
          <div className="space-y-4">
            <h3 className="font-serif italic text-2xl tracking-tight">
              编年史
            </h3>
            <p className="max-w-xs text-sm opacity-50 font-light leading-relaxed">
              来自新艾利都世界的数字档案馆，记录每一个被遗忘的数据片段。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
                项目
              </h4>
              <ul className="space-y-2 text-sm font-light opacity-60">
                <li>
                  <a href="/" className="hover:opacity-100 transition-opacity">
                    首页
                  </a>
                </li>
                <li>
                  <a
                    href="/database"
                    className="hover:opacity-100 transition-opacity"
                  >
                    档案馆
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
                联系方式
              </h4>
              <ul className="space-y-2 text-sm font-light opacity-60">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[10px] opacity-30 tracking-widest uppercase">
            © {new Date().getFullYear()} Chronicles Archive. 版权所有
          </div>
          <div className="flex gap-4">
            <span className="font-mono text-[10px] opacity-30 tracking-widest uppercase">
              Stable_v2.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
