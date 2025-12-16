import { CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, Edit3, Eye, Trash2 } from "lucide-react";

import { isPostPubliclyViewable, type PostListItem } from "../types";

interface PostRowProps {
  post: PostListItem;
  onDelete: (post: PostListItem) => void;
}

export function PostRow({ post, onDelete }: PostRowProps) {
  const navigate = useNavigate();

  const viewTitle = !isPostPubliclyViewable(post)
    ? post.status === "draft"
      ? "Cannot view Draft"
      : "Scheduled - not yet public"
    : "View Public";

  return (
    <div className="group bg-zzz-dark border border-zzz-gray p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:border-zzz-lime transition-all relative overflow-hidden">
      {/* Status Stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          post.status === "draft" ? "bg-zzz-orange" : "bg-zzz-lime"
        }`}
      />

      {/* ID */}
      <div className="md:col-span-1 font-mono text-gray-500 text-xs flex justify-between md:block">
        <span className="md:hidden">ID:</span> #{post.id}
      </div>

      {/* Title & Summary */}
      <div
        className="md:col-span-5 min-w-0 cursor-pointer"
        onClick={() => navigate({ to: `/admin/posts/edit/${post.id}` })}
      >
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold font-sans uppercase text-base md:text-lg leading-tight wrap-break-word md:truncate flex-1">
              {post.title}
            </h3>
            {post.status !== "published" && (
              <span
                className={`text-[9px] px-1.5 py-0.5 font-bold rounded-sm shrink-0 border ${
                  post.status === "draft"
                    ? "border-zzz-orange text-zzz-orange"
                    : "border-red-500 text-red-500"
                }`}
              >
                {post.status}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono truncate">
          {post.summary}
        </div>
      </div>

      {/* Category */}
      <div className="md:col-span-2 flex items-center">
        <span
          className={`text-[10px] px-2 py-0.5 border ${
            CATEGORY_COLORS[post.category]
          } bg-black/40`}
        >
          {post.category}
        </span>
      </div>

      {/* Date */}
      <div className="md:col-span-2 font-mono text-xs text-gray-400 shrink-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Calendar size={10} />
          <ClientOnly fallback={<span>-</span>}>
            {formatDate(post.createdAt)}
          </ClientOnly>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={10} /> {post.readTimeInMinutes} MINS
        </div>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end gap-2 mt-2 md:mt-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          disabled={!isPostPubliclyViewable(post)}
          onClick={() =>
            navigate({ to: "/post/$slug", params: { slug: post.slug } })
          }
          className={`h-8 w-8 flex items-center justify-center border transition-colors ${
            post.status === "draft"
              ? "text-gray-700 border-gray-800 cursor-not-allowed"
              : "text-zzz-cyan border-zzz-cyan hover:bg-zzz-cyan hover:text-black"
          }`}
          title={viewTitle}
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() =>
            navigate({
              to: "/admin/posts/edit/$id",
              params: { id: String(post.id) },
            })
          }
          className="h-8 w-8 flex items-center justify-center border border-zzz-lime text-zzz-lime hover:bg-zzz-lime hover:text-black transition-colors"
          title="Edit"
        >
          <Edit3 size={14} />
        </button>
        <button
          className="h-8 w-8 flex items-center justify-center border border-zzz-orange text-zzz-orange hover:bg-zzz-orange hover:text-black transition-colors"
          title="Delete"
          onClick={() => onDelete(post)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
