import { ContentRenderer } from "@/components/content-renderer";
import { ArticleSkeleton } from "@/components/skeletons/article-skeleton";
import TableOfContents from "@/components/table-of-content";
import TechButton from "@/components/ui/tech-button";
import { findPostBySlugFn } from "@/functions/posts";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, RefreshCw, Share2 } from "lucide-react";

function postQuery(slug: string) {
  return queryOptions({
    queryKey: [slug],
    queryFn: () => findPostBySlugFn({ data: { slug } }),
  });
}

export const Route = createFileRoute("/post/$slug")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(postQuery(params.slug));
  },
  pendingComponent: ArticleSkeleton,
});

function RouteComponent() {
  const { data: post } = useSuspenseQuery(postQuery(Route.useParams().slug));
  const router = useRouter();

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-4xl font-black text-zzz-orange uppercase">
          Error 404
        </h2>
        <p className="font-mono text-gray-400">
          Data corruption detected. Log entry not found.
        </p>
        <button
          onClick={() => router.history.back()}
          className="text-zzz-lime underline font-bold font-mono"
        >
          RETURN TO DATABASE
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 px-4 md:px-8">
      {/* Top Control Bar */}
      <div className="mb-8 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-forwards">
        <TechButton
          onClick={() => router.history.back()}
          variant="secondary"
          icon={<ArrowLeft size={16} />}
        >
          RETURN
        </TechButton>
        <div className="hidden md:flex flex-col items-end font-mono text-xs text-zzz-gray">
          <span>
            READING_MODE: <span className="text-zzz-lime">ENHANCED</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8 items-start">
        {/* Main Article Card */}
        <article className="relative bg-zzz-black border border-zzz-gray shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-backwards">
          {/* Decorative Top Bar */}
          <div className="w-full h-2 bg-stripe-pattern border-b border-zzz-gray"></div>

          {/* Title Header Section */}
          <div className="p-6 md:p-12 pb-8 border-b border-zzz-gray bg-zzz-dark relative overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-dot-pattern"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-zzz-lime blur-[150px] opacity-10 pointer-events-none animate-pulse-fast"></div>

            <div
              className={`inline-flex items-center gap-2 mb-8 px-3 py-1 font-mono font-bold text-xs bg-black border ${
                CATEGORY_COLORS[post.category]
              } uppercase tracking-widest animate-in slide-in-from-left-4 duration-700 delay-100 fill-mode-backwards`}
            >
              <div
                className={`w-2 h-2 rounded-sm ${
                  post.category === "DEV" ? "bg-zzz-lime" : "bg-white"
                }`}
              ></div>
              {post.category} // LOG_ENTRY
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-sans text-white uppercase leading-[0.9] mb-8 relative z-10 drop-shadow-xl tracking-tight animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
              {post.title}
            </h1>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-sm font-mono text-gray-400 border-t border-zzz-gray/30 pt-6 animate-in fade-in duration-700 delay-300 fill-mode-backwards">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zzz-gray rounded-sm text-zzz-lime">
                  <Calendar size={14} />
                </div>
                <span className="tracking-widest text-white">
                  <ClientOnly fallback={<span>-</span>}>
                    {formatDate(post.publishedAt)}
                  </ClientOnly>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zzz-gray rounded-sm text-zzz-lime">
                  <Clock size={14} />
                </div>
                <span className="tracking-widest text-white">
                  {post.readTimeInMinutes} MINS READ TIME
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zzz-gray rounded-sm text-zzz-lime">
                  <RefreshCw size={14} />
                </div>
                <span className="tracking-widest text-white">
                  UPDATED:{" "}
                  <ClientOnly fallback={<span>-</span>}>
                    {formatDate(post.updatedAt)}
                  </ClientOnly>
                </span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-12 bg-zzz-black relative">
            {/* Sidebar decoration line */}
            <div className="hidden md:block absolute left-4 top-12 bottom-12 w-px bg-zzz-gray"></div>

            <div className="text-xl md:text-2xl font-bold text-zzz-lime mb-16 font-sans border-l-4 border-zzz-gray pl-6 italic max-w-3xl leading-snug animate-in slide-in-from-right-4 duration-700 delay-500 fill-mode-backwards">
              {post.summary}
            </div>

            <div className="max-w-none md:pl-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-backwards min-h-[500px]">
              <ContentRenderer content={post.contentJson} />
            </div>

            <div className="mt-20 pt-8 border-t-2 border-zzz-gray border-dashed flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in duration-700 delay-700">
              <div className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                ID: {post.id} // END OF DATA STREAM // VERIFIED
              </div>
              <TechButton variant="secondary" icon={<Share2 size={16} />}>
                SHARE_LOG
              </TechButton>
            </div>
          </div>

          {/* Deco Corners */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-zzz-lime clip-corner-bl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-zzz-lime clip-corner-tr"></div>
        </article>

        {/* Sticky Table of Contents Sidebar */}
        <TableOfContents headers={post.toc} />
      </div>
    </div>
  );
}
