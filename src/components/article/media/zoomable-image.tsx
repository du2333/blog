import { ClientOnly } from "@tanstack/react-router";
import { Download, X, ZoomIn } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ZoomableImageProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
	className?: string;
	showHint?: boolean;
	src?: string;
}

const ZoomableImageInternal: React.FC<ZoomableImageProps> = ({
	className = "",
	alt = "",
	src,
	showHint = false,
	...props
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClose = () => {
		setIsOpen(false);
	};

	// Lock body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		}
		else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape")
				handleClose();
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	const originalSrc = React.useMemo(() => {
		if (!src)
			return undefined;

		try {
			const base
				= typeof window !== "undefined" ? window.location.origin : undefined;
			const url = base ? new URL(src, base) : new URL(src);
			url.searchParams.set("original", "true");
			return url.toString();
		}
		catch {
			return src.includes("?")
				? `${src}&original=true`
				: `${src}?original=true`;
		}
	}, [src]);

	if (!src)
		return null;

	return (
		<>
			<div
				className="relative group cursor-zoom-in block w-full h-auto"
				onClick={() => setIsOpen(true)}
			>
				<img
					src={src}
					alt={alt}
					loading="lazy"
					decoding="async"
					className={`${className} block`}
					{...props}
				/>

				{/* Hover Hint Overlay */}
				{showHint && (
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
						<div className="bg-popover/90 backdrop-blur-sm p-4 rounded-full border border-border transform scale-90 group-hover:scale-100 transition-all duration-500 shadow-xl">
							<ZoomIn size={20} />
						</div>
					</div>
				)}
			</div>

			{/* Lightbox Portal - Always mounted but controlled via visibility/opacity */}
			{createPortal(
				<div
					className={`fixed inset-0 z-200 flex items-center justify-center transition-all duration-500 ease-in-out ${
						isOpen
							? "opacity-100 pointer-events-auto"
							: "opacity-0 pointer-events-none"
					}`}
				>
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
						onClick={handleClose}
					/>

					{/* Controls */}
					<div
						className={`absolute top-0 left-0 right-0 p-10 flex justify-between items-start z-210 transition-all duration-500 ease-in-out ${
							isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
						}`}
					>
						<div className="flex flex-col">
							<span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-[0.4em]">
								{alt || "Untitled"}
							</span>
						</div>
						<div className="flex gap-6">
							<a href={originalSrc} download target="_blank" rel="noreferrer">
								<button className="p-2 text-muted-foreground hover:text-foreground transition-all duration-300">
									<Download size={18} />
								</button>
							</a>
							<button
								onClick={handleClose}
								className="p-2 text-muted-foreground hover:text-foreground transition-all duration-300"
							>
								<X size={22} />
							</button>
						</div>
					</div>

					{/* Image */}
					<div
						className={`relative z-205 p-6 md:p-20 w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out ${
							isOpen ? "scale-100 opacity-100" : "scale-[1.01] opacity-0"
						}`}
					>
						<img
							src={src}
							alt={alt}
							loading="eager"
							className="max-w-full max-h-full object-contain shadow-2xl"
						/>
					</div>

					{/* Footer Decoration */}
					<div
						className={`absolute bottom-12 left-0 right-0 text-center pointer-events-none transition-opacity duration-500 delay-200 ${
							isOpen ? "opacity-100" : "opacity-0"
						}`}
					>
						<span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.8em]">
							Esc or Click to Return
						</span>
					</div>
				</div>,
				document.body,
			)}
		</>
	);
};

export default function ZoomableImage(props: ZoomableImageProps) {
	return (
		<ClientOnly>
			<ZoomableImageInternal {...props} />
		</ClientOnly>
	);
}
