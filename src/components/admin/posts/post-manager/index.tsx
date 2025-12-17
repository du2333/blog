import { ErrorPage } from "@/components/common/error-page";
import { LoadingFallback } from "@/components/common/loading-fallback";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import TechButton from "@/components/ui/tech-button";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-sans uppercase text-white italic">
            Data <span className="text-zzz-lime">Logs</span>
          </h1>
          <div className="text-[10px] font-mono text-gray-500 tracking-widest mt-1">
            TOTAL_RECORDS: {totalCount} // FILTERED: {posts.length}
          </div>
        </div>
        <TechButton
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "创建中..." : "新建条目"}
        </TechButton>
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
        <LoadingFallback />
      ) : (
        <div className="space-y-2 relative z-0">
          {posts.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center border border-dashed border-zzz-gray text-gray-500 font-mono text-xs gap-4">
              <ListFilter size={48} className="opacity-20" />
              <div className="text-center">
                NO_DATA_MATCHING_CRITERIA
                <br />
                <span
                  className="text-zzz-orange mt-2 block cursor-pointer hover:underline"
                  onClick={onResetFilters}
                >
                  [CLEAR_FILTERS]
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono text-gray-600 font-bold uppercase tracking-wider border-b border-zzz-gray/30">
                <div className="col-span-1">ID</div>
                <div className="col-span-5">主题 (Subject)</div>
                <div className="col-span-2">分类 (Class)</div>
                <div className="col-span-2">日期 (Date)</div>
                <div className="col-span-2 text-right">操作 (Ops)</div>
              </div>

              {posts.map((post) => (
                <PostRow key={post.id} post={post} onDelete={handleDelete} />
              ))}
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
        title="PURGE DATA LOG"
        message={`你确定要永久删除条目 "${postToDelete?.title}"? 此操作无法撤销。`}
        confirmLabel="永久删除"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
