import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { memo } from "react";
import type { PostListItem } from "@/features/posts/posts.schema";
import { formatDate } from "@/lib/utils";

interface PostItemProps {
  post: PostListItem;
}

export const PostItem = memo(({ post }: PostItemProps) => {
  return (
    <div className="py-6 first:pt-0 last:pb-0 group">
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="block space-y-3"
      >
        <h3 className="text-xl md:text-2xl font-serif font-medium leading-tight text-foreground group-hover:text-muted-foreground transition-colors duration-300">
          {post.title}
        </h3>

        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground/70 font-mono tracking-wide">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="opacity-70" />
            <time dateTime={post.publishedAt?.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
          </div>

          {post.tags && post.tags.length > 0 && (
            <>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag.id} className="text-muted-foreground/80">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-muted-foreground font-light leading-relaxed max-w-3xl line-clamp-2 text-sm md:text-base">
          {post.summary}
        </p>
      </Link>
    </div>
  );
});

PostItem.displayName = "PostItem";
