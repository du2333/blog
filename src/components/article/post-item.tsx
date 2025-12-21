import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { memo } from "react";
import { PostListItem } from "@/lib/db/schema";

interface PostItemProps {
  post: PostListItem;
  index: number;
}

export const PostItem = memo(({ post, index }: PostItemProps) => (
  <Link
    to="/post/$slug"
    params={{ slug: post.slug }}
    className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-12 border-b border-zinc-100 dark:border-white/10 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-[background-color] duration-300 px-4 -mx-4"
  >
    {/* Index/Number */}
    <div className="md:col-span-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mt-2">
      {(index + 1).toString().padStart(2, "0")}
    </div>

    {/* Title and Summary */}
    <div className="md:col-span-7 space-y-4">
      <h3 className="text-3xl md:text-5xl font-serif leading-tight text-zinc-950 dark:text-zinc-50 group-hover:translate-x-2 transition-transform duration-700">
        {post.title}
      </h3>
      <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed line-clamp-2">
        {post.summary}
      </p>
    </div>

    {/* Meta Info */}
    <div className="md:col-span-4 flex flex-col md:items-end justify-between py-2">
      <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
        <span>{post.category}</span>
        <span className="w-1 h-1 rounded-full bg-current"></span>
        <span className="flex items-center gap-1">
          <Clock size={10} /> {post.readTimeInMinutes} min
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-zinc-950 dark:text-zinc-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
        阅读全文 <ArrowRight size={12} />
      </div>
    </div>
  </Link>
));

PostItem.displayName = "PostItem";
