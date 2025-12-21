import { ErrorPage } from "@/components/common/error-page";
import { PostManagerSkeleton } from "@/components/skeletons/post-manager-skeleton";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { createEmptyPostFn } from "@/features/posts/api/posts.admin.api";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_ITEMS_PER_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ListFilter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PostRow, PostsPagination, PostsToolbar } from "./components";
import { useDeletePost, usePosts } from "./hooks";
import {
  type CategoryFilter,
  type PostListItem,
  type SortDirection,
  type StatusFilter,
} from "./types";

// Re-export types for external use
export {
  CATEGORY_FILTERS,
  SORT_DIRECTIONS,
  STATUS_FILTERS,
  type CategoryFilter,
  type SortDirection,
  type StatusFilter,
} from "./types";

interface PostManagerProps {
  page: number;
  status: StatusFilter;
  category: CategoryFilter;
  sortDir: SortDirection;
  search: string;
  onPageChange: (page: number) => void;
  onStatusChange: (status: StatusFilter) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onSortChange: (dir: SortDirection) => void;
  onSearchChange: (search: string) => void;
  onResetFilters: () => void;
}

export function PostManager({
  page,
  status,
  category,
  sortDir,
  search,
  onPageChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  onResetFilters,
}: PostManagerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [postToDelete, setPostToDelete] = useState<PostListItem | null>(null);

  // Local search input state for debouncing
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, search, onSearchChange]);

  // Sync local state when URL search changes (e.g., browser back/forward, reset)
  useEffect(() => {
    if (search !== searchInput && search !== debouncedSearch) {
      setSearchInput(search);
    }
  }, [search]);

  // Fetch posts data using debounced search
  const { posts, totalCount, totalPages, isPending, error } = usePosts({
    page,
    status,
    category,
    sortDir,
    search: debouncedSearch,
  });

  // Create empty post mutation
  const createMutation = useMutation({
    mutationFn: () => createEmptyPostFn(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate({
        to: "/admin/posts/edit/$id",
        params: { id: String(result.id) },
      });
    },
    onError: (error) => {
      toast.error("新建条目失败", {
        description: error.message,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useDeletePost({
    onSuccess: () => setPostToDelete(null),
  });

  const handleDelete = (post: PostListItem) => {
    setPostToDelete(post);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight">文章管理</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-mono">
            Archive Registry // {totalCount} Records
          </p>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.2em] font-medium hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
        >
          <Plus size={14} />
          {createMutation.isPending ? "创建中..." : "新建文章"}
        </button>
      </div>

      {/* Toolbar */}
      <PostsToolbar
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        category={category}
        onCategoryChange={onCategoryChange}
        status={status}
        onStatusChange={onStatusChange}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onResetFilters={() => {
          setSearchInput("");
          onResetFilters();
        }}
      />

      {/* List Content */}
      {error ? (
        <ErrorPage error={error} />
      ) : isPending ? (
        <PostManagerSkeleton />
      ) : (
        <div className="space-y-0 border-t border-zinc-100 dark:border-white/5">
          {posts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-400 font-serif italic gap-4">
              <ListFilter size={40} strokeWidth={1} className="opacity-20" />
              <div className="text-center">
                未找到匹配的文章
                <button
                  className="text-zinc-900 dark:text-zinc-100 mt-4 block text-[10px] uppercase tracking-widest font-mono hover:underline"
                  onClick={onResetFilters}
                >
                  [清除所有筛选]
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Header (Simplified) */}
              <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold border-b border-zinc-100 dark:border-white/5">
                <div className="col-span-1">ID</div>
                <div className="col-span-6">文章摘要</div>
                <div className="col-span-2">分类</div>
                <div className="col-span-2">日期</div>
                <div className="col-span-1 text-right">操作</div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-white/5">
                {posts.map((post) => (
                  <PostRow key={post.id} post={post} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      <PostsPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={ADMIN_ITEMS_PER_PAGE}
        currentPageItemCount={posts.length}
        onPageChange={onPageChange}
      />

      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => !deleteMutation.isPending && setPostToDelete(null)}
        onConfirm={confirmDelete}
        title="删除文章"
        message={`您确定要永久删除文章 "${postToDelete?.title}" 吗？此操作无法撤销。`}
        confirmLabel="确认删除"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
