export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#050505] py-20 mt-32 transition-colors duration-500">
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
          <div className="space-y-4">
            <div className="w-10 h-10 text-zinc-900 dark:text-zinc-100">
              <div className="w-full h-full border-[1.5px] border-current rounded-full flex items-center justify-center p-[20%]">
                <div className="w-full h-full bg-current rounded-full"></div>
              </div>
            </div>
            <p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              记录每一个被遗忘的数据片段。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 dark:text-zinc-600">
                项目
              </h4>
              <ul className="space-y-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
                <li>
                  <a href="/" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                    首页
                  </a>
                </li>
                <li>
                  <a
                    href="/database"
                    className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    档案馆
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 dark:text-zinc-600">
                联系方式
              </h4>
              <ul className="space-y-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">
            © {new Date().getFullYear()} Chronicle Archive. 版权所有
          </div>
        </div>
      </div>
    </footer>
  );
}
