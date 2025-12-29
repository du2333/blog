import type { PostListItem } from "@/lib/db/schema";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";

interface PostItemProps {
	post: PostListItem;
	index: number;
}

export const PostItem = memo(({ post, index }: PostItemProps) => (
	<Link
		to="/post/$slug"
		params={{ slug: post.slug }}
		className="group grid grid-cols-1 md:grid-cols-12 gap-8 py-12 border-b border-border/50 hover:bg-accent/30 transition-all duration-500 px-6 -mx-6"
	>
		{/* Index/Number */}
		<div className="md:col-span-1 text-[11px] font-mono font-medium text-muted-foreground/30 mt-2">
			{(index + 1).toString().padStart(2, "0")}
		</div>

		{/* Title and Summary */}
		<div className="md:col-span-7 space-y-4">
			<h3 className="text-3xl md:text-5xl font-serif font-medium leading-tight text-foreground group-hover:translate-x-2 transition-transform duration-700">
				{post.title}
			</h3>
			<p className="text-sm md:text-base text-muted-foreground max-w-2xl font-normal leading-relaxed line-clamp-2">
				{post.summary}
			</p>
		</div>

		{/* Meta Info */}
		<div className="md:col-span-4 flex flex-col md:items-end justify-between py-2">
			<div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
				<Badge variant="outline" className="font-mono tracking-widest uppercase rounded-sm border-border/50 text-muted-foreground px-2 py-0.5">
					{post.category}
				</Badge>
				<span className="flex items-center gap-1.5">
					<Clock size={12} strokeWidth={1.5} />
					{" "}
					{post.readTimeInMinutes}
					{" "}
					min
				</span>
			</div>

			<div className="hidden md:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
				阅读全文
				{" "}
				<ArrowRight size={14} />
			</div>
		</div>
	</Link>
));

PostItem.displayName = "PostItem";
