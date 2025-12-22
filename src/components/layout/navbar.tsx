import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Moon, Search, Sun, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/common/theme-provider";

interface NavbarProps {
	navOptions: {
		label: string;
		to: string;
		id: string;
	}[];
	onSearchClick: () => void;
	onMenuClick: () => void;
	onOpenProfile: () => void;
	isLoading?: boolean;
	user?: {
		name: string;
		image?: string | null;
		role?: string | null;
	};
}

export function Navbar({
	onSearchClick,
	onMenuClick,
	user,
	navOptions,
	onOpenProfile,
	isLoading,
}: NavbarProps) {
	const { appTheme, setTheme } = useTheme();
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<header
				className={`fixed top-0 left-0 right-0 z-40 h-28 flex items-center transition-all duration-700 ${
					isScrolled
						? "bg-background/90 backdrop-blur-2xl border-b border-border h-20 shadow-sm"
						: "bg-transparent border-b border-transparent h-28"
				}`}
			>
				<div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex items-center justify-between">
					{/* Left: Brand */}
					<Link to="/" className="group select-none flex items-center gap-4">
						<div className="w-9 h-9 text-foreground relative">
							<div className="absolute inset-0 border-2 border-current rounded-full group-hover:scale-110 transition-transform duration-700"></div>
							<div className="absolute inset-[30%] bg-current rounded-full group-hover:scale-75 transition-transform duration-700"></div>
						</div>
						<span className="hidden md:block text-[11px] font-bold uppercase tracking-[0.6em] text-foreground">
							Chronicle
						</span>
					</Link>

					{/* Center: Main Nav (Absolute center for true minimalist feel) */}
					<nav className="hidden lg:flex items-center gap-16">
						{navOptions.map((option) => (
							<Link
								key={option.id}
								to={option.to}
								className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground hover:text-foreground transition-all py-2 font-bold relative group"
								activeProps={{
									className: "!text-foreground",
								}}
							>
								{({ isActive }) => (
									<>
										{option.label}
										<span
											className={`absolute -bottom-1 left-0 h-0.5 bg-current transition-all duration-700 ease-out ${
												isActive
													? "w-full"
													: "w-0 group-hover:w-full opacity-0 group-hover:opacity-20"
											}`}
										/>
									</>
								)}
							</Link>
						))}
					</nav>

					{/* Right: Actions */}
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<button
								onClick={() => setTheme(appTheme === "dark" ? "light" : "dark")}
								className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
								title="Theme"
							>
								{appTheme === "dark" ? (
									<Sun size={16} strokeWidth={1.2} />
								) : (
									<Moon size={16} strokeWidth={1.2} />
								)}
							</button>
							<button
								onClick={onSearchClick}
								className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
								title="Search"
							>
								<Search size={16} strokeWidth={1.2} />
							</button>
						</div>

						<div className="h-4 w-px bg-border hidden md:block" />

						{/* Profile / Menu Toggle */}
						<div className="flex items-center gap-4">
							<div className="hidden md:flex items-center gap-4">
								{isLoading ? (
									<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
								) : (
									<div className="flex items-center gap-4 animate-in fade-in duration-700 fill-mode-both">
										{user ? (
											<>
												{user.role === "admin" && (
													<Link
														to="/admin"
														className="p-2.5 hover:bg-accent rounded-full transition-all duration-500 text-muted-foreground hover:text-foreground"
														title="进入后台"
													>
														<LayoutDashboard size={18} strokeWidth={1.5} />
													</Link>
												)}
												<button
													onClick={onOpenProfile}
													className="group flex items-center p-0.5 rounded-full border border-transparent hover:border-border transition-all duration-500"
												>
													<div className="w-8 h-8 rounded-full overflow-hidden border border-border/50 p-0.5 transition-all duration-700">
														{user.image ? (
															<img
																src={user.image}
																alt={user.name}
																className="w-full h-full rounded-full object-cover"
															/>
														) : (
															<div className="w-full h-full bg-muted flex items-center justify-center">
																<UserIcon
																	size={14}
																	className="text-zinc-300"
																	strokeWidth={1}
																/>
															</div>
														)}
													</div>
												</button>
											</>
										) : (
											<Link to="/login">
												<span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground transition-colors font-medium">
													Login
												</span>
											</Link>
										)}
									</div>
								)}
							</div>

							<button
								className="w-10 h-10 flex flex-col items-center justify-center gap-1 group"
								onClick={onMenuClick}
							>
								<div className="w-6 h-px bg-foreground transition-transform group-hover:scale-x-75 origin-right"></div>
								<div className="w-6 h-px bg-foreground transition-transform group-hover:scale-x-110 origin-right"></div>
							</button>
						</div>
					</div>
				</div>
			</header>
			{/* Spacer to push content down since header is fixed */}
			<div className="h-28"></div>
		</>
	);
}
