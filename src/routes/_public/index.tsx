import { LoadingFallback } from "@/components/common/loading-fallback";
import { featuredPostsQuery } from "@/features/posts/posts.query";
import { HERO_ASSETS } from "@/lib/config/assets";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  const heroPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-10">
      {/* Hero Section - Minimalist & Bold */}
      <section className="min-h-[70vh] flex flex-col justify-center py-20 md:py-32 border-b border-zinc-100 dark:border-zinc-900">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out fill-mode-forwards">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-black dark:bg-white/40"></span>
              <span className="text-xs uppercase tracking-[0.3em] font-mono opacity-60">
                新艾利都编年史
              </span>
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
              <span>访问档案馆</span>
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
            <h2 className="text-4xl md:text-5xl font-serif">最新传输</h2>
            <p className="opacity-50 font-mono text-sm tracking-widest uppercase italic">
              // Incoming stream
            </p>
          </div>
          <Link
            to="/database"
            className="text-sm border-b border-zinc-200 dark:border-zinc-800 pb-1 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors"
          >
            浏览所有故事
          </Link>
        </div>

        <div className="flex flex-col gap-0 border-t border-zinc-100 dark:border-zinc-900">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              to="/post/$slug"
              params={{ slug: post.slug }}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-12 border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors duration-500 px-4 -mx-4"
            >
              {/* Index/Number */}
              <div className="md:col-span-1 text-[10px] font-mono opacity-30 mt-2">
                0{index + 1}
              </div>

              {/* Title and Summary */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-3xl md:text-5xl font-serif leading-tight group-hover:translate-x-2 transition-transform duration-700">
                  {post.title}
                </h3>
                <p className="text-sm md:text-base opacity-50 max-w-2xl font-light leading-relaxed line-clamp-2">
                  {post.summary}
                </p>
              </div>

              {/* Meta Info */}
              <div className="md:col-span-4 flex flex-col md:items-end justify-between py-2">
                <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase opacity-40">
                  <span>{post.category}</span>
                  <span className="w-1 h-1 rounded-full bg-current"></span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {post.readTimeInMinutes} min
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  阅读全文 <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
