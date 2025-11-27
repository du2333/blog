import { CATEGORY_COLORS } from "@/lib/constants";
import { BlogPost } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock, Database } from "lucide-react";

interface FeaturedTransmissionProps {
  posts: BlogPost[];
}

export function FeaturedTransmission({ posts }: FeaturedTransmissionProps) {
  // Ensure we have at least one post
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 4); // Next 3 posts

  return (
    <section>
      <div className="flex items-end justify-between mb-8 border-b border-zzz-gray pb-4">
        <div>
          <h3 className="text-3xl font-black font-sans uppercase italic text-white">
            Featured <span className="text-zzz-lime">Transmissions</span>
          </h3>
          <p className="font-mono text-xs text-gray-500 mt-1">
            SELECT * FROM ARCHIVES WHERE PRIORITY = 'HIGH'
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-mono text-zzz-lime hover:underline flex items-center gap-1"
        >
          VIEW_ALL <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
        {/* Big Featured Card (Col-span-2, Row-span-2) */}
        <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden border-2 border-zzz-gray hover:border-zzz-lime transition-all rounded-lg bg-zzz-dark h-[400px] md:h-auto">
          <Link
            to={`/post/$id`}
            params={{ id: featuredPost!.id }}
            className="block h-full w-full relative"
          >
            {/* Background: Random Placeholder Image for Featured Post */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <img
                src={`https://picsum.photos/seed/${featuredPost!.id}/800/800`}
                alt="Featured Cover"
                className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
              />
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent"></div>

            <div className="relative z-10 p-8 h-full flex flex-col justify-end">
              <div className="mb-4">
                <span
                  className={`inline-block px-2 py-1 text-xs font-bold bg-zzz-lime text-black mb-2 ${CATEGORY_COLORS[
                    featuredPost!.category
                  ]
                    .replace("text-", "bg-")
                    .replace("border-", "")}`}
                >
                  {featuredPost!.category}
                </span>
                <h2 className="text-3xl md:text-5xl font-black font-sans text-white uppercase leading-[0.9] mb-2 group-hover:text-zzz-lime transition-colors">
                  {featuredPost!.title}
                </h2>
              </div>
              <p className="text-gray-300 font-mono text-sm line-clamp-2 max-w-md border-l-2 border-zzz-lime pl-3 bg-black/30 backdrop-blur-xs p-2 rounded-r">
                {featuredPost!.summary}
              </p>

              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded border border-zzz-gray flex items-center gap-2 text-xs font-mono text-zzz-white">
                <Clock size={12} /> {featuredPost!.readTime}
              </div>
            </div>
          </Link>
        </div>

        {/* Standard Cards */}
        {recentPosts.map((post) => (
          <div
            key={post.id}
            className="md:col-span-1 relative group bg-zzz-dark border border-zzz-gray hover:border-zzz-lime transition-all flex flex-col overflow-hidden rounded-lg min-h-60"
          >
            <Link
              to={`/post/$id`}
              params={{ id: post.id }}
              className="flex flex-col h-full"
            >
              <div className="h-32 overflow-hidden relative border-b border-zzz-gray group-hover:border-zzz-lime/50 bg-zzz-black">
                {/* Pattern Header for Standard Cards */}
                <div className="absolute inset-0 bg-zzz-black flex items-center justify-center overflow-hidden">
                  {/* Subtle Grid */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
                      backgroundSize: "10px 10px",
                    }}
                  ></div>

                  {/* Diagonal Lines */}
                  <div className="w-full h-px bg-zzz-gray/30 transform rotate-45 absolute"></div>
                  <div className="w-full h-px bg-zzz-gray/30 transform -rotate-45 absolute"></div>

                  {/* Category Tint Overlay */}
                  <div
                    className={`absolute inset-0 opacity-5 ${CATEGORY_COLORS[
                      post.category
                    ]
                      .replace("text-", "bg-")
                      .replace("border-", "")}`}
                  ></div>
                </div>

                <div className="absolute top-2 right-2 bg-black px-2 py-0.5 text-[10px] font-mono font-bold text-zzz-white border border-zzz-gray z-10">
                  {post.category}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col bg-zzz-dark">
                <h4 className="text-lg font-bold font-sans text-white uppercase leading-tight mb-2 group-hover:text-zzz-lime line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500 font-mono line-clamp-2 mb-4 flex-1">
                  {post.summary}
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-zzz-gray/20 mt-auto">
                  <span className="text-[10px] font-mono text-gray-600">
                    {post.date}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-zzz-gray group-hover:text-zzz-lime transition-colors"
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Decorative "More" Block */}
        <div className="md:col-span-1 bg-zzz-lime/10 border border-zzz-lime/30 rounded-lg flex flex-col items-center justify-center p-6 text-center group hover:bg-zzz-lime hover:text-black transition-all cursor-pointer min-h-60">
          {/* Fake Link behavior via parent container click handling or wrapping in Link if routing needed */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <Database
              size={32}
              className="mb-3 text-zzz-lime group-hover:text-black transition-colors"
            />
            <span className="font-black font-sans text-xl uppercase">
              Access
              <br />
              Archives
            </span>
            <span className="mt-2 text-xs font-mono opacity-60">
              View all entries -&gt;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
