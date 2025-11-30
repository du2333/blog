import { ClientOnly, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Edit3,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import TechButton from "@/components/ui/tech-button";
import { useState } from "react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Post } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/posts/")({
  component: PostManager,
});

function PostManager() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT"
  >("ALL");

  const filteredPosts: Post[] = [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black font-sans uppercase text-white italic">
          Data <span className="text-zzz-lime">Logs</span>
        </h1>
        <Link to="/admin/posts/new">
          <TechButton size="sm" icon={<Plus size={14} />}>
            New Entry
          </TechButton>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-20">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="SEARCH_LOGS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zzz-gray text-white text-xs font-mono px-10 py-3 focus:border-zzz-lime focus:outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`w-full md:w-auto h-full px-6 py-3 md:py-0 border bg-zzz-dark flex items-center justify-between md:justify-start gap-2 text-xs font-bold uppercase transition-colors ${
              filterOpen
                ? "border-zzz-lime text-white"
                : "border-zzz-gray text-gray-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter size={14} />
              {activeFilter === "ALL" ? "Filter" : activeFilter}
            </div>
          </button>

          {/* Dropdown */}
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-zzz-black border border-zzz-gray shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200 clip-corner-bl">
              <div className="p-1">
                {["ALL", "PUBLISHED", "DRAFT"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setActiveFilter(status as any);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 md:py-2 text-xs font-mono font-bold hover:bg-zzz-gray/30 ${
                      activeFilter === status
                        ? "text-zzz-lime"
                        : "text-gray-400"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List Header (Desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono text-gray-600 font-bold uppercase tracking-wider border-b border-zzz-gray/30">
        <div className="col-span-1">ID</div>
        <div className="col-span-5">Subject</div>
        <div className="col-span-2">Class</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 text-right">Operations</div>
      </div>

      {/* List */}
      <div className="space-y-2 relative z-0">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="group bg-zzz-dark border border-zzz-gray p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:border-zzz-lime transition-all relative overflow-hidden"
          >
            {/* Status Stripe */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                post.status === "draft" ? "bg-zzz-orange" : "bg-zzz-lime"
              }`}
            ></div>

            <div className="md:col-span-1 font-mono text-gray-500 text-xs flex justify-between md:block">
              <span className="md:hidden">ID:</span> #{post.id}
            </div>

            <div className="md:col-span-5 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-bold font-sans uppercase truncate text-lg leading-none">
                  {post.title}
                </h3>
                {post.status === "draft" && (
                  <span className="text-[10px] bg-zzz-orange text-black px-1 font-bold rounded-sm">
                    DRAFT
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-mono truncate">
                {post.summary}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center">
              <span
                className={`text-[10px] px-2 py-0.5 border ${
                  CATEGORY_COLORS[post.category]
                }`}
              >
                {post.category}
              </span>
            </div>

            <div className="md:col-span-2 font-mono text-xs text-gray-400 shrink-0">
              <ClientOnly fallback={<span>-</span>}>
                {formatDate(post.createdAt)}
              </ClientOnly>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2 md:mt-0 opacity-50 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() =>
                  navigate({ to: "/post/$slug", params: { slug: post.slug } })
                }
                className="p-2 bg-black border border-zzz-gray text-zzz-cyan hover:bg-zzz-cyan hover:text-black transition-colors"
                title="View Public"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() =>
                  navigate({
                    to: "/admin/posts/edit/$slug",
                    params: { slug: post.slug },
                  })
                }
                className="p-2 bg-black border border-zzz-gray text-zzz-lime hover:bg-zzz-lime hover:text-black transition-colors"
                title="Edit"
              >
                <Edit3 size={14} />
              </button>
              <button
                className="p-2 bg-black border border-zzz-gray text-zzz-orange hover:bg-zzz-orange hover:text-black transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Pagination */}
      <div className="flex items-center justify-between border-t border-zzz-gray pt-6 mt-6">
        <div className="text-xs font-mono text-gray-500">
          SHOWING {filteredPosts.length} RECORDS
        </div>
        <div className="flex gap-2">
          <button
            disabled
            className="p-2 border border-zzz-gray text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button className="h-8 w-8 flex items-center justify-center bg-zzz-lime text-black font-bold font-mono text-xs border border-zzz-lime">
            1
          </button>
          <button className="h-8 w-8 flex items-center justify-center bg-black text-gray-400 font-bold font-mono text-xs border border-zzz-gray hover:text-white hover:border-white transition-colors">
            2
          </button>
          <button className="h-8 w-8 flex items-center justify-center bg-black text-gray-400 font-bold font-mono text-xs border border-zzz-gray hover:text-white hover:border-white transition-colors">
            3
          </button>
          <span className="h-8 w-8 flex items-center justify-center text-gray-600">
            <MoreHorizontal size={12} />
          </span>
          <button className="p-2 border border-zzz-gray text-gray-400 hover:text-white hover:border-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
