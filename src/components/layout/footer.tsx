export function Footer() {
	return (
		<footer className="border-t border-border bg-background py-24 mt-32 transition-colors duration-500">
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				<div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 text-foreground relative">
								<div className="absolute inset-0 border-2 border-current rounded-full"></div>
								<div className="absolute inset-[30%] bg-current rounded-full"></div>
							</div>
							<span className="text-[12px] font-bold uppercase tracking-[0.6em] text-foreground">
								Chronicle
							</span>
						</div>
						<p className="max-w-xs text-sm text-muted-foreground font-normal leading-relaxed">
							记录技术、思考与数字生活。
						</p>
					</div>

					<div className="grid grid-cols-2 gap-12 md:gap-24">
						<div className="space-y-4">
							<h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
								索引
							</h4>
							<ul className="space-y-2 text-sm font-normal text-muted-foreground">
								<li>
									<a
										href="/"
										className="hover:text-foreground transition-colors"
									>
										首页
									</a>
								</li>
								<li>
									<a
										href="/blog"
										className="hover:text-foreground transition-colors"
									>
										文章
									</a>
								</li>
							</ul>
						</div>
						<div className="space-y-4">
							<h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
								社交
							</h4>
							<ul className="space-y-2 text-sm font-normal text-muted-foreground">
								<li>
									<a
										href="https://github.com"
										target="_blank"
										rel="noreferrer"
										className="hover:text-foreground transition-colors"
									>
										Github
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
						© {new Date().getFullYear()} Chronicle Archive. 版权所有
					</div>
				</div>
			</div>
		</footer>
	);
}
