import { Link } from "@tanstack/react-router";
import { memo } from "react";
import type { PostListItem } from "@/features/posts/posts.schema";
import { formatDate } from "@/lib/utils";

interface PostItemProps {
  post: PostListItem;
}

export const PostItem = memo(({ post }: PostItemProps) => {
  return (
    <div className="group border-b border-border/40 last:border-0">
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="block py-8 md:py-10 transition-all duration-300 hover:pl-4"
      >
        <div className="flex flex-col gap-3">
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/60 tracking-wider">
            <time dateTime={post.publishedAt?.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="opacity-30">/</span>
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-muted-foreground/60 uppercase"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <h3 className="text-2xl md:text-3xl font-serif font-medium text-foreground group-hover:text-foreground/70 transition-colors duration-300">
            {post.title}
          </h3>

          <p className="text-muted-foreground font-light leading-relaxed max-w-2xl line-clamp-2 text-sm md:text-base font-sans mt-1 group-hover:text-muted-foreground/80">
            {post.summary}
          </p>
        </div>
      </Link>
    </div>
  );
});

PostItem.displayName = "PostItem";
