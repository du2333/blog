import { LoadingFallback } from "@/components/common/loading-fallback";
import { featuredPostsQuery } from "@/features/posts/posts.query";
import { HERO_ASSETS } from "@/lib/config/assets";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PostItem } from "@/components/article/post-item";

export const Route = createFileRoute("/_public/")({
  component: App,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(featuredPostsQuery);
  },
  head: () => ({
    links: [...HERO_ASSETS],
  }),
  pendingComponent: LoadingFallback,
});

function App() {
  const { data: posts } = useSuspenseQuery(featuredPostsQuery);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-10">
      {/* Hero Section - Minimalist & Bold */}
      <section className="min-h-[70vh] flex flex-col justify-center py-20 md:py-32 border-b border-zinc-100 dark:border-zinc-900">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out fill-mode-forwards">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-black dark:bg-white/40"></span>
            </div>
            <h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight">
              数字 <br />
              <span className="italic font-normal opacity-80">异象</span>
            </h1>
          </header>

          <p className="max-w-xl text-lg md:text-xl font-light leading-relaxed opacity-70">
            在衰败的都市中探索科技与人性的交汇点。记录空洞侵蚀的痕迹与残留的数字记忆。
          </p>

          <div className="pt-8">
            <Link
              to="/database"
              className="group inline-flex items-center gap-4 text-sm font-medium uppercase tracking-widest hover:gap-6 transition-all duration-500"
            >
              <span>浏览文章</span>
              <div className="w-12 h-12 rounded-full border border-zinc-100 dark:border-zinc-900 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-500">
                <ArrowRight size={18} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Stories - Bento/Clean Grid */}
      <section className="py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif">最新文章</h2>
          </div>
          <Link
            to="/database"
            className="text-sm border-b border-zinc-200 dark:border-zinc-800 pb-1 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors"
          >
            浏览所有
          </Link>
        </div>

        <div className="flex flex-col gap-0 border-t border-zinc-100 dark:border-zinc-900">
          {posts.map((post, index) => (
            <PostItem key={post.id} post={post} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
