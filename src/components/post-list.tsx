import { Link } from "@tanstack/react-router";
import { BlogPost } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { Clock, ArrowUpRight } from "lucide-react";

export function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
      {posts.map((post, index) => {
        // Parse date for styled display
        const dateObj = new Date(post.date);
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = dateObj
          .toLocaleString("default", { month: "short" })
          .toUpperCase();
        const year = dateObj.getFullYear();

        return (
          <Link
            key={post.id}
            to={`/post/$id`}
            params={{ id: post.id }}
            className="group relative bg-zzz-dark border-2 border-zzz-gray hover:border-zzz-lime transition-all duration-300 cursor-pointer overflow-hidden clip-corner-tr flex flex-col h-full min-h-[280px]"
          >
            {/* Top Bar Decoration */}
            <div className="h-2 bg-zzz-gray w-full group-hover:bg-zzz-lime transition-colors flex">
              <div className="w-1/3 h-full bg-black/20"></div>
              <div className="w-1/3 h-full bg-transparent"></div>
              <div className="w-1/3 h-full bg-black/20"></div>
            </div>

            <div className="p-6 flex-1 flex flex-col relative z-10">
              {/* Header: Category & ID */}
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`px-3 py-1 text-xs font-bold font-mono tracking-widest bg-black border ${
                    CATEGORY_COLORS[post.category]
                  } uppercase`}
                >
                  {post.category}
                </div>
                <div className="text-4xl font-black text-zzz-gray/20 group-hover:text-zzz-lime/20 font-sans transition-colors select-none">
                  {(index + 1).toString().padStart(2, "0")}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold font-sans text-white mb-4 leading-none uppercase group-hover:text-zzz-lime transition-colors">
                {post.title}
              </h3>

              {/* Summary */}
              <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6 line-clamp-3">
                {post.summary}
              </p>

              {/* Footer Info (High Contrast) */}
              <div className="mt-auto pt-6 border-t border-zzz-gray group-hover:border-zzz-lime/50 transition-colors flex justify-between items-center">
                {/* High Contrast Date Block */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-zzz-lime text-black border-2 border-zzz-lime px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                    <span className="text-xs font-bold leading-none tracking-wider">
                      {month}
                    </span>
                    <span className="text-xl font-black leading-none">
                      {day}
                    </span>
                  </div>
                  <div className="flex flex-col font-mono text-xs text-gray-500">
                    <span className="text-zzz-white font-bold">{year}</span>
                    <span className="flex items-center gap-1 group-hover:text-zzz-lime transition-colors">
                      <Clock size={10} /> {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Action Icon */}
                <div className="w-10 h-10 border border-zzz-gray bg-black group-hover:bg-zzz-lime group-hover:border-zzz-lime group-hover:text-black flex items-center justify-center transition-all">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-stripe-pattern opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-zzz-lime to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </Link>
        );
      })}
    </div>
  );
}
