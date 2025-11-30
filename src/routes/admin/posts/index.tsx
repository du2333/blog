import { LoadingFallback } from "@/components/loading-fallback";
import TechButton from "@/components/ui/tech-button";
import type { PostStatus } from "@/db/schema";
import { getPostsCountFn, getPostsFn } from "@/functions/posts";
import { ADMIN_ITEMS_PER_PAGE, CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ClientOnly,
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";

const POST_FILTERS = ["ALL", "PUBLISHED", "DRAFT"] as const;

/** Check if a post is publicly viewable */
function isPostPubliclyViewable(post: {
  status: PostStatus;
  publishedAt: Date | null;
}): boolean {
  if (post.status !== "published") return false;
  if (!post.publishedAt) return false;
  return post.publishedAt <= new Date();
}

const searchSchema = z.object({
  page: z.number().int().positive().optional().default(1).catch(1),
  filter: z.enum(POST_FILTERS).optional().default("ALL").catch("ALL"),
});

export const Route = createFileRoute("/admin/posts/")({
  validateSearch: searchSchema,
  component: PostManager,
});

function PostManager() {
  const navigate = useNavigate();
  const { page, filter } = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: posts, isPending } = useQuery({
    queryKey: ["posts", page, filter],
    queryFn: () =>
      getPostsFn({
        data: {
          offset: (page - 1) * ADMIN_ITEMS_PER_PAGE,
          limit: ADMIN_ITEMS_PER_PAGE,
          status:
            filter === "ALL"
              ? undefined
              : filter === "PUBLISHED"
              ? "published"
              : "draft",
        },
      }),
  });

  const { data: postsCount } = useQuery({
    queryKey: ["postsCount", filter],
    queryFn: () =>
      getPostsCountFn({
        data: {
          status:
            filter === "ALL"
              ? undefined
              : filter === "PUBLISHED"
              ? "published"
              : "draft",
        },
      }),
  });

  const totalPages = Math.ceil((postsCount ?? 0) / ADMIN_ITEMS_PER_PAGE);

  const filteredPosts = posts ?? [];

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // If total pages are small, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      // Start Window: 1, 2, 3, 4, 5 ... Last
      pages.push(1, 2, 3, 4, 5);
      pages.push("...");
      pages.push(totalPages);
    } else if (page >= totalPages - 3) {
      // End Window: 1 ... Last-4, Last-3, Last-2, Last-1, Last
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // Middle Window: 1 ... Curr-1, Curr, Curr+1 ... Last
      pages.push(1);
      pages.push("...");
      pages.push(page - 1);
      pages.push(page);
      pages.push(page + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
              {filter === "ALL" ? "Filter" : filter}
            </div>
          </button>

          {/* Dropdown */}
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-zzz-black border border-zzz-gray shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200 clip-corner-bl">
              <div className="p-1">
                {POST_FILTERS.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      navigate({
                        to: "/admin/posts",
                        search: {
                          page: 1,
                          filter: status,
                        },
                      });
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 md:py-2 text-xs font-mono font-bold hover:bg-zzz-gray/30 ${
                      filter === status ? "text-zzz-lime" : "text-gray-400"
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
      {isPending ? (
        <LoadingFallback />
      ) : (
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
                  disabled={!isPostPubliclyViewable(post)}
                  onClick={() =>
                    navigate({
                      to: "/post/$slug",
                      params: { slug: post.slug },
                    })
                  }
                  className={`h-9 w-9 cursor-pointer flex items-center justify-center bg-black border border-zzz-gray transition-colors ${
                    !isPostPubliclyViewable(post)
                      ? "text-gray-600 cursor-not-allowed border-gray-800"
                      : "text-zzz-cyan hover:bg-zzz-cyan hover:text-black"
                  }`}
                  title={
                    !isPostPubliclyViewable(post)
                      ? post.status === "draft"
                        ? "Cannot view Draft"
                        : "Scheduled - not yet public"
                      : "View Public"
                  }
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
                  className="p-2 bg-black border border-zzz-gray text-zzz-lime hover:bg-zzz-lime hover:text-black transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className="p-2 bg-black border border-zzz-gray text-zzz-orange hover:bg-zzz-orange hover:text-black transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zzz-gray pt-6 mt-6">
          <div className="text-xs font-mono text-gray-500">
            SHOWING{" "}
            {Math.min(
              (page - 1) * ADMIN_ITEMS_PER_PAGE + 1,
              filteredPosts.length
            )}{" "}
            - {Math.min(page * ADMIN_ITEMS_PER_PAGE, filteredPosts.length)} OF{" "}
            {filteredPosts.length} RECORDS
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate({
                  to: "/admin/posts",
                  search: { page: page - 1, filter },
                })
              }
              disabled={page === 1}
              className="h-9 w-9 flex items-center justify-center border border-zzz-gray text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((pageNumber, index) => (
              <React.Fragment key={index}>
                {pageNumber === "..." ? (
                  <div className="h-9 w-9 flex items-center justify-center text-gray-600 font-mono text-xs">
                    <MoreHorizontal size={14} />
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      navigate({
                        to: "/admin/posts",
                        search: { page: pageNumber as number, filter },
                      })
                    }
                    className={`h-9 w-9 cursor-pointer flex items-center justify-center font-bold font-mono text-xs border transition-colors ${
                      page === pageNumber
                        ? "bg-zzz-lime text-black border-zzz-lime"
                        : "bg-black text-gray-400 border-zzz-gray hover:text-white hover:border-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() =>
                navigate({
                  to: "/admin/posts",
                  search: { page: page + 1, filter },
                })
              }
              disabled={page === totalPages}
              className="h-9 w-9 flex items-center justify-center border border-zzz-gray text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
