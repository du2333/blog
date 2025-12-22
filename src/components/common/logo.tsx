import type React from "react";

interface LogoProps {
	className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-6 h-6" }) => {
	return (
		<div
			className={`${className} relative flex items-center justify-center`}
			aria-label="Chronicles Logo"
		>
			{/* Awwwards style: Geometric, minimalist, abstract */}
			<div className="w-full h-full border-[1.5px] border-current rounded-full flex items-center justify-center p-[20%]">
				<div className="w-full h-full bg-current rounded-full animate-pulse-slow"></div>
			</div>

			{/* Optional: Add a subtle rotating ring around it if needed, but let's keep it clean first */}
		</div>
	);
};
