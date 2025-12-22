import { Loader2, Radio } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";

interface PostLoaderProps {
	onLoadMore: () => void;
	isLoading: boolean;
	hasMore: boolean;
}

export const PostLoader: React.FC<PostLoaderProps> = ({
	onLoadMore,
	isLoading,
	hasMore,
}) => {
	const observerTarget = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					onLoadMore();
				}
			},
			{ threshold: 0.5 }, // Trigger when 50% visible
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget.current);
			}
		};
	}, [hasMore, isLoading, onLoadMore]);

	return (
		<div
			ref={observerTarget}
			className="w-full py-16 flex flex-col items-center justify-center opacity-80"
		>
			{isLoading ? (
				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<div className="w-12 h-12 border-2 border-zzz-lime border-t-transparent rounded-full animate-spin"></div>
						<div className="absolute inset-0 flex items-center justify-center">
							<Loader2 size={20} className="text-zzz-lime animate-pulse" />
						</div>
					</div>
					<div className="font-mono text-xs text-zzz-lime tracking-[0.2em] animate-pulse">
						DECRYPTING_SECTOR_DATA...
					</div>
				</div>
			) : hasMore ? (
				<div
					className="font-mono text-[10px] text-gray-600 uppercase tracking-widest hover:text-zzz-cyan cursor-pointer transition-colors"
					onClick={onLoadMore}
				>
					Scroll to decrypt more...
				</div>
			) : (
				<div className="flex flex-col items-center gap-2">
					<div className="w-64 h-px bg-linear-to-r from-transparent via-zzz-gray to-transparent"></div>
					<div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
						<Radio size={12} /> END_OF_ARCHIVE
					</div>
				</div>
			)}
		</div>
	);
};
