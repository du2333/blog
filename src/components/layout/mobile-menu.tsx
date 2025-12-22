import { Link } from "@tanstack/react-router";
import { LogOut, UserIcon, X } from "lucide-react";

interface MobileMenuProps {
	navOptions: {
		label: string;
		to: string;
		id: string;
		color: string;
	}[];
	isOpen: boolean;
	onClose: () => void;
	user?: {
		name: string;
		image?: string | null;
		role?: string | null;
	};
	logout: () => Promise<void>;
	onOpenProfile: () => void;
}

export function MobileMenu({
	navOptions,
	isOpen,
	onClose,
	user,
	logout,
	onOpenProfile,
}: MobileMenuProps) {
	return (
		<div
			className={`fixed inset-0 z-[100] transition-all duration-500 ease-in-out ${
				isOpen
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none"
			}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-white/95 dark:bg-[#050505]/98 backdrop-blur-2xl"
				onClick={onClose}
			/>

			{/* Content Container */}
			<div
				className={`relative h-full w-full flex flex-col p-8 md:p-20 transition-all duration-500 delay-75 ${
					isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
				}`}
			>
				{/* Header */}
				<div className="flex justify-between items-center">
					<div className="flex flex-col">
						<span className="font-serif italic text-2xl tracking-tight text-zinc-950 dark:text-zinc-50">
							菜单
						</span>
					</div>
					<button
						onClick={onClose}
						className="w-12 h-12 flex items-center justify-center rounded-full border border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
					>
						<X size={24} strokeWidth={1.5} />
					</button>
				</div>

				{/* Links */}
				<nav className="flex-1 flex flex-col justify-center space-y-8 md:space-y-12">
					{navOptions.map((item, idx) => (
						<Link
							key={item.id}
							to={item.to}
							onClick={onClose}
							className={`group flex items-baseline gap-6 transition-all duration-500 ${
								isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
							}`}
							activeProps={{
								className: "!text-zinc-950 dark:!text-zinc-50",
							}}
							style={{ transitionDelay: isOpen ? `${50 + idx * 50}ms` : "0ms" }}
						>
							{({ isActive }) => (
								<>
									<span
										className={`font-mono text-[10px] transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-20 group-hover:opacity-100"}`}
									>
										0{idx + 1}
									</span>
									<span
										className={`text-5xl md:text-8xl font-serif font-medium tracking-tight group-hover:translate-x-4 transition-all duration-700 relative`}
									>
										{item.label}
										{isActive && (
											<span className="absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 w-4 md:w-6 h-px bg-current animate-in slide-in-from-left-4 duration-500" />
										)}
									</span>
								</>
							)}
						</Link>
					))}

					{user?.role === "admin" && (
						<Link
							to="/admin"
							onClick={onClose}
							className={`group flex items-baseline gap-6 transition-all duration-500 ${
								isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
							}`}
							activeProps={{
								className: "!text-zinc-950 dark:!text-zinc-50",
							}}
							style={{
								transitionDelay: isOpen
									? `${100 + navOptions.length * 75}ms`
									: "0ms",
							}}
						>
							{({ isActive }) => (
								<>
									<span
										className={`font-mono text-[10px] transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-20 group-hover:opacity-100"}`}
									>
										0{navOptions.length + 1}
									</span>
									<span
										className={`text-5xl md:text-8xl font-serif font-medium tracking-tight group-hover:translate-x-4 transition-all duration-700 relative`}
									>
										控制台
										{isActive && (
											<span className="absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 w-4 md:w-6 h-px bg-current animate-in slide-in-from-left-4 duration-500" />
										)}
									</span>
								</>
							)}
						</Link>
					)}
				</nav>

				{/* Footer: User Info */}
				<div
					className={`transition-all duration-500 ${
						isOpen
							? "opacity-100 translate-y-0 delay-500"
							: "opacity-0 translate-y-4"
					}`}
				>
					{user ? (
						<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-12 border-t border-zinc-100 dark:border-zinc-900">
							<button
								onClick={() => {
									onOpenProfile();
									onClose();
								}}
								className="flex items-center gap-6 group"
							>
								<div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-900 p-1 grayscale group-hover:grayscale-0 transition-all duration-700">
									{user.image ? (
										<img
											src={user.image}
											alt={user.name}
											className="w-full h-full rounded-full object-cover"
										/>
									) : (
										<div className="w-full h-full rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
											<UserIcon size={24} strokeWidth={1} />
										</div>
									)}
								</div>
								<div className="text-left">
									<div className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">
										{user.name}
									</div>
									<div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
										个人资料
									</div>
								</div>
							</button>

							<button
								onClick={() => {
									logout();
									onClose();
								}}
								className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 hover:text-red-500 transition-colors py-4"
							>
								<LogOut size={14} />
								<span>退出登录</span>
							</button>
						</div>
					) : (
						<Link
							to="/login"
							onClick={onClose}
							className="inline-block pt-12 border-t border-zinc-100 dark:border-zinc-900 w-full"
						>
							<span className="text-4xl md:text-6xl font-serif font-medium tracking-tight transition-all">
								登录 / Login
							</span>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
