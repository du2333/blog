import { CATEGORY_COLORS } from "@/lib/constants";
import type { Post } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Zap } from "lucide-react";

export function FeaturedTransmission({
  posts,
}: {
  posts: Pick<
    Post,
    | "id"
    | "title"
    | "summary"
    | "slug"
    | "category"
    | "readTimeInMinutes"
    | "updatedAt"
  >[];
}) {
  if (posts.length === 0) return null;

  const heroPost = posts[0];
  const sidePosts = posts.slice(1, 4);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- HERO SECTION (Left / Top) --- */}
        <Link
          to={"/post/$slug"}
          params={{ slug: heroPost.slug }}
          className="lg:col-span-8 group relative bg-zzz-dark border-2 border-zzz-gray hover:border-zzz-lime cursor-pointer transition-all duration-500 overflow-hidden min-h-[500px] flex flex-col"
        >
          {/* Background Video / Pattern */}
          <div className="absolute inset-0 z-0">
            <video
              src="/assets/hollow.webm"
              poster="/assets/hollow.webp"
              preload="auto"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100"
            />

            <div className="absolute inset-0 bg-linear-to-t from-zzz-black via-zzz-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-linear-to-r from-zzz-black/90 via-transparent to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex-1 flex flex-col p-8 md:p-12">
            {/* Top Meta */}
            <div className="flex justify-between items-start mb-auto">
              <div className="flex items-center gap-3">
                <div className="bg-zzz-lime text-black font-black text-xs px-2 py-1 uppercase tracking-widest animate-pulse">
                  Latest_Signal
                </div>
                <div
                  className={`text-[10px] font-mono border ${
                    CATEGORY_COLORS[heroPost.category]
                  } px-2 py-1 uppercase bg-black`}
                >
                  {heroPost.category}
                </div>
              </div>
              <div className="text-6xl md:text-8xl font-black text-white/5 font-sans leading-none select-none">
                01
              </div>
            </div>

            {/* Main Title Area */}
            <div className="mt-8 md:mt-0">
              <h3 className="text-4xl md:text-6xl lg:text-7xl font-black font-sans text-white uppercase leading-tight mb-6 group-hover:text-zzz-lime transition-colors max-w-4xl drop-shadow-2xl wrap-break-word line-clamp-3 md:line-clamp-4">
                {heroPost.title}
              </h3>
              <p className="text-gray-300 font-mono text-sm md:text-base max-w-2xl leading-relaxed border-l-2 border-zzz-lime pl-4 mb-8 line-clamp-3">
                {heroPost.summary}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto pt-8 border-t border-zzz-gray/30 flex items-center justify-between">
              <div className="flex items-center gap-6 font-mono text-xs text-zzz-gray group-hover:text-white transition-colors">
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-zzz-lime" />{" "}
                  {heroPost.readTimeInMinutes} MINS
                </span>
                <span>//</span>
                <span>
                  <ClientOnly fallback={<span>-</span>}>
                    {formatDate(heroPost.updatedAt)}
                  </ClientOnly>
                </span>
              </div>
              <div className="flex items-center gap-2 text-zzz-lime font-bold font-sans uppercase tracking-wider text-sm group-hover:translate-x-2 transition-transform">
                Read_Log <ArrowUpRight size={18} />
              </div>
            </div>
          </div>

          {/* Decorative Corners */}
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-zzz-lime opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-zzz-lime opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        {/* --- SIDEBAR FEED (Right / Bottom) --- */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex items-center justify-between bg-zzz-dark border border-zzz-gray px-4 py-2 mb-2">
            <span className="font-mono text-xs font-bold text-zzz-cyan uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} /> Incoming_Stream
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-zzz-cyan rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-zzz-cyan rounded-full animate-pulse delay-75"></div>
              <div className="w-1.5 h-1.5 bg-zzz-cyan rounded-full animate-pulse delay-150"></div>
            </div>
          </div>

          {/* List Items */}
          {sidePosts.map((post, index) => (
            <Link
              key={post.id}
              to={"/post/$slug"}
              params={{ slug: post.slug }}
              className="group flex-1 bg-black border border-zzz-gray hover:border-zzz-cyan p-5 cursor-pointer transition-all hover:bg-zzz-gray/10 relative overflow-hidden flex flex-col justify-center"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-[10px] text-gray-500 group-hover:text-zzz-cyan transition-colors">
                  LOG_0{index + 2}
                </div>
                <div
                  className={`text-[10px] px-1.5 py-0.5 border ${
                    CATEGORY_COLORS[post.category]
                  } uppercase`}
                >
                  {post.category}
                </div>
              </div>

              <h4 className="text-xl font-bold font-sans text-white uppercase leading-tight mb-2 group-hover:text-zzz-cyan transition-colors line-clamp-2">
                {post.title}
              </h4>

              <div className="flex items-center gap-4 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-gray-400">
                  <ClientOnly fallback={<span>-</span>}>
                    {formatDate(post.updatedAt)}
                  </ClientOnly>
                </span>
              </div>

              {/* Hover Indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-zzz-cyan transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
            </Link>
          ))}

          {/* "More" Hint */}
          <div className="mt-auto text-center border-t border-dashed border-zzz-gray pt-2">
            <span className="font-mono text-[10px] text-gray-600">
              SCROLL FOR ARCHIVE ACCESS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
