import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ClientOnly,
  Link,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";
import { ArrowUp, Calendar, Clock, Share2, Tag as TagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContentRenderer } from "@/features/posts/components/view/content-renderer";
import TableOfContents from "@/features/posts/components/view/table-of-content";
import { CommentSection } from "@/features/comments/components/view/comment-section";
import { ArticleSkeleton } from "@/features/posts/components/article-skeleton";

import { Button } from "@/components/ui/button";
import { postBySlugQuery } from "@/features/posts/posts.query";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const Route = createFileRoute("/_public/post/$slug")({
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
    <div className="w-full max-w-7xl mx-auto pb-32 px-6 md:px-12">
      {/* Back Link */}
      <nav className="py-12 animate-in fade-in duration-500 fill-mode-both max-w-4xl">
        <Breadcrumbs />
      </nav>

      <article className="space-y-16">
        {/* Header Section */}
        <header className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both max-w-4xl">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} strokeWidth={1.5} />
                <ClientOnly fallback={<span>-</span>}>
                  {formatDate(post.publishedAt)}
                </ClientOnly>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} strokeWidth={1.5} />
                {post.readTimeInMinutes} min
              </span>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-border/40 font-mono">|</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to="/post"
                        search={{ tagName: tag.name }}
                        className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border transition-all duration-300"
                      >
                        <TagIcon
                          size={10}
                          className="text-muted-foreground group-hover:text-foreground transition-colors"
                        />
                        <span className="text-[10px] font-mono lowercase text-muted-foreground group-hover:text-foreground transition-colors tracking-tight">
                          {tag.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] tracking-tight text-foreground">
              {post.title}
            </h1>
          </div>

          <p className="text-xl md:text-2xl font-normal leading-relaxed text-muted-foreground border-l border-border pl-8 italic">
            {post.summary}
          </p>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-20 items-start">
          <main className="min-w-0 max-w-3xl prose prose-zinc prose-invert prose-lg md:prose-xl animate-in fade-in duration-700 delay-200 fill-mode-both text-foreground leading-relaxed">
            <ContentRenderer content={post.contentJson} />

            <footer className="mt-32 pt-12 border-t border-border flex justify-end items-center">
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
                className="group h-auto p-0 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors bg-transparent hover:bg-transparent"
              >
                <Share2 size={14} strokeWidth={1.5} />
                <span>分享文章</span>
              </Button>
            </footer>
          </main>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block sticky top-32 animate-in fade-in duration-700 delay-300 fill-mode-both">
            <div className="pl-8 border-l border-border">
              <TableOfContents headers={post.toc} />
            </div>
          </aside>
        </div>

        {/* Comments Section */}
        <div className="max-w-3xl">
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
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-500 group"
        >
          <ArrowUp
            size={20}
            className="group-hover:-translate-y-1 transition-transform"
          />
        </Button>
      </div>
    </div>
  );
}
