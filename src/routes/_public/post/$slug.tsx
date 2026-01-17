import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ClientOnly,
  Link,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";
import { ArrowUp, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { postBySlugQuery } from "@/features/posts/queries";
import { ContentRenderer } from "@/features/posts/components/view/content-renderer";
import TableOfContents from "@/features/posts/components/view/table-of-content";
import { CommentSection } from "@/features/comments/components/view/comment-section";
import { ArticleSkeleton } from "@/features/posts/components/article-skeleton";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
      <nav className="py-12 animate-in fade-in duration-500 fill-mode-both flex items-center justify-between">
        <Breadcrumbs />
      </nav>

      <article className="space-y-16">
        {/* Header Section */}
        <header className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground/60 tracking-wider uppercase">
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
                  <div className="flex items-center gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to="/post"
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

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight text-foreground">
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

          <main className="prose prose-zinc prose-invert prose-lg md:prose-xl max-w-none animate-in fade-in duration-700 delay-200 fill-mode-both text-foreground leading-relaxed font-serif prose-headings:font-serif prose-code:font-mono prose-pre:border-0 prose-pre:bg-secondary/20">
            <ContentRenderer content={post.contentJson} />

            <footer className="mt-24 pt-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">
                {/* Footer metadata if needed */}
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
                className="group h-auto p-0 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors bg-transparent hover:bg-transparent"
              >
                <Share2 size={14} strokeWidth={1.5} />
                <span>分享文章</span>
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
      <div
        className={`fixed bottom-12 right-12 z-40 transition-all duration-700 ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Button
          size="icon"
          variant="outline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-10 h-10 rounded-full border border-border/40 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-500 group shadow-sm"
        >
          <ArrowUp
            size={16}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
        </Button>
      </div>
    </div>
  );
}
