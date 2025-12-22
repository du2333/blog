export function Footer() {
	return (
		<footer className="border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#050505] py-24 mt-32 transition-colors duration-500">
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				<div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 text-zinc-950 dark:text-zinc-50 relative">
								<div className="absolute inset-0 border-[2px] border-current rounded-full"></div>
								<div className="absolute inset-[30%] bg-current rounded-full"></div>
							</div>
							<span className="text-[12px] font-bold uppercase tracking-[0.6em] text-zinc-950 dark:text-zinc-50">
								Chronicle
							</span>
						</div>
						<p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
							记录技术、思考与数字生活。
						</p>
					</div>

					<div className="grid grid-cols-2 gap-12 md:gap-24">
						<div className="space-y-4">
							<h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 dark:text-zinc-600">
								索引
							</h4>
							<ul className="space-y-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
								<li>
									<a
										href="/"
										className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
									>
										首页
									</a>
								</li>
								<li>
									<a
										href="/blog"
										className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
									>
										文章
									</a>
								</li>
							</ul>
						</div>
						<div className="space-y-4">
							<h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 dark:text-zinc-600">
								社交
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

				<div className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">
						© {new Date().getFullYear()} Chronicle Archive. 版权所有
					</div>
				</div>
			</div>
		</footer>
	);
}
