import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ClientOnly,
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft, ArrowUp, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { postBySlugQuery } from "@/features/posts/queries";
import { ContentRenderer } from "@/features/posts/components/view/content-renderer";
import TableOfContents from "@/features/posts/components/view/table-of-content";
import { CommentSection } from "@/features/comments/components/view/comment-section";
import { ArticleSkeleton } from "@/features/posts/components/view/article-skeleton";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const searchSchema = z.object({
  highlightCommentId: z.coerce.number().optional(),
  rootId: z.number().optional(),
});

export const Route = createFileRoute("/_public/post/$slug")({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(
      postBySlugQuery(params.slug),
    );
    if (!post) {
      throw notFound();
    }
    return post;
  },
  head: ({ loaderData: post }) => ({
    meta: [
      {
        title: post?.title,
      },
      {
        name: "description",
        content: post?.summary ?? "",
      },
      { property: "og:title", content: post?.title ?? "" },
      { property: "og:description", content: post?.summary ?? "" },
      { property: "og:type", content: "article" },
    ],
  }),
  pendingComponent: ArticleSkeleton,
});

function RouteComponent() {
  const { data: post } = useSuspenseQuery(
    postBySlugQuery(Route.useParams().slug),
  );
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) throw notFound();

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 px-6 md:px-0">
      {/* Back Link */}
      <nav className="py-12 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/posts" })}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={12} />
          <span>返回目录</span>
        </button>
      </nav>

      <article className="space-y-16">
        {/* Header Section */}
        <header className="space-y-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground/60 tracking-wider">
              <span className="flex items-center gap-1.5">
                <ClientOnly fallback={<span>-</span>}>
                  {formatDate(post.publishedAt)}
                </ClientOnly>
              </span>
              <span className="opacity-30">/</span>
              <span>{post.readTimeInMinutes} 分钟</span>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <>
                  <span className="opacity-30">/</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to="/posts"
                        search={{ tagName: tag.name }}
                        className="hover:text-foreground transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight text-foreground"
              style={{ viewTransitionName: `post-title-${post.slug}` }}
            >
              {post.title}
            </h1>
          </div>

          <p className="text-lg md:text-xl font-light leading-relaxed text-muted-foreground border-l-[1.5px] border-foreground/20 pl-6 italic">
            {post.summary}
          </p>
        </header>

        {/* Content Layout */}
        <div className="relative">
          {/* Floating TOC for Large Screens */}
          <aside className="hidden xl:block absolute left-full ml-12 top-0 h-full">
            <div className="sticky top-32 w-60">
              <TableOfContents headers={post.toc} />
            </div>
          </aside>

          <main className="max-w-none text-foreground leading-relaxed font-serif">
            <ContentRenderer content={post.contentJson} />

            <footer className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground/60 tracking-widest uppercase">
                <span className="opacity-50">///</span>
                <span>End of Article</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(
                    decodeURIComponent(window.location.href),
                  );
                  toast.success("链接已复制", {
                    description: "文章链接已复制到剪贴板",
                  });
                }}
                className="group h-auto p-0 flex items-center gap-3 text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent hover:bg-transparent"
              >
                <span>分享</span>
                <Share2
                  size={12}
                  strokeWidth={1.5}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
              </Button>
            </footer>
          </main>
        </div>

        {/* Comments Section */}
        <div className="pt-12 border-t border-border/40">
          <CommentSection postId={post.id} />
        </div>
      </article>

      {/* Back To Top */}
      {/* Back To Top */}
      <div
        className={`fixed bottom-8 right-8 z-40 transition-all duration-700 ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex flex-col items-center gap-1.5"
        >
          <ArrowUp
            size={16}
            className="text-muted-foreground/60 group-hover:text-foreground group-hover:-translate-y-1 transition-all duration-300"
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-foreground transition-colors duration-300">
            Top
          </span>
        </button>
      </div>
    </div>
  );
}
