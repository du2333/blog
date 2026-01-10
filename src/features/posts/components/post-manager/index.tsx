import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ListFilter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PostRow, PostsToolbar } from "./components";
import { useDeletePost, usePosts } from "./hooks";
import { PostManagerSkeleton } from "./post-manager-skeleton";
import type {
  CategoryFilter,
  PostListItem,
  SortDirection,
  StatusFilter,
} from "./types";
import { ErrorPage } from "@/components/common/error-page";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/admin-pagination";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { createEmptyPostFn } from "@/features/posts/api/posts.admin.api";
import { useDebounce } from "@/hooks/use-debounce";

import { ADMIN_ITEMS_PER_PAGE } from "@/lib/constants";

// Re-export types for external use
export {
  CATEGORY_FILTERS,
  type CategoryFilter,
  SORT_DIRECTIONS,
  type SortDirection,
  STATUS_FILTERS,
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
    onError: (e) => {
      toast.error("新建条目失败", {
        description: e.message,
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
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight">
            文章管理
          </h1>
          <p className="text-sm text-muted-foreground">
            发布、编辑或删除博客文章
          </p>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="h-12 px-8 text-[11px] uppercase tracking-[0.2em] font-medium rounded-sm gap-2"
        >
          <Plus size={14} />
          {createMutation.isPending ? "创建中..." : "新建文章"}
        </Button>
      </div>

      <div className="animate-in fade-in duration-1000 delay-100 fill-mode-both space-y-12">
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
          <div className="space-y-0 border-t border-border">
            {posts.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-muted-foreground font-serif italic gap-4">
                <ListFilter size={40} strokeWidth={1} className="opacity-20" />
                <div className="text-center">
                  未找到匹配的文章
                  <button
                    className="mt-4 block text-[10px] uppercase tracking-widest font-mono hover:underline"
                    onClick={onResetFilters}
                  >
                    [清除所有筛选]
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Header (Simplified) */}
                <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold border-b border-border">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-6">文章摘要</div>
                  <div className="col-span-2">分类</div>
                  <div className="col-span-2">日期</div>
                  <div className="col-span-1 text-right">操作</div>
                </div>

                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={ADMIN_ITEMS_PER_PAGE}
          currentPageItemCount={posts.length}
          onPageChange={onPageChange}
        />
      </div>

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
