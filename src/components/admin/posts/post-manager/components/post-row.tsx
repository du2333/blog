import { CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { Edit3, Eye, Trash2 } from "lucide-react";

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
      <div className="md:col-span-5 min-w-0">
        <div
          className="flex items-center gap-3 mb-1 cursor-pointer"
          onClick={() =>
            navigate({
              to: "/admin/posts/edit/$id",
              params: { id: String(post.id) },
            })
          }
        >
          <h3 className="text-white font-bold font-sans uppercase truncate text-lg">
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

      {/* Category */}
      <div className="md:col-span-2 flex items-center">
        <span
          className={`text-[10px] px-2 py-0.5 border ${
            CATEGORY_COLORS[post.category]
          }`}
        >
          {post.category}
        </span>
      </div>

      {/* Date */}
      <div className="md:col-span-2 font-mono text-xs text-gray-400 shrink-0">
        <ClientOnly fallback={<span>-</span>}>
          {formatDate(post.createdAt)}
        </ClientOnly>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end gap-2 mt-2 md:mt-0 opacity-50 group-hover:opacity-100 transition-opacity">
        <button
          disabled={!isPostPubliclyViewable(post)}
          onClick={() =>
            navigate({ to: "/post/$slug", params: { slug: post.slug } })
          }
          className={`h-9 w-9 flex items-center justify-center bg-black border border-zzz-gray transition-colors ${
            !isPostPubliclyViewable(post)
              ? "text-gray-600 cursor-not-allowed border-gray-800"
              : "text-zzz-cyan hover:bg-zzz-cyan hover:text-black"
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
          className="p-2 bg-black border border-zzz-gray text-zzz-lime hover:bg-zzz-lime hover:text-black transition-colors"
          title="Edit"
        >
          <Edit3 size={14} />
        </button>
        <button
          className="p-2 bg-black border border-zzz-gray text-zzz-orange hover:bg-zzz-orange hover:text-black transition-colors"
          title="Delete"
          onClick={() => onDelete(post)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
