import { ErrorPage } from "@/components/common/error-page";
import { LoadingFallback } from "@/components/common/loading-fallback";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import TechButton from "@/components/ui/tech-button";
import { createEmptyPostFn } from "@/features/posts/api/posts.api";
import { ADMIN_ITEMS_PER_PAGE } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import {
  PostRow,
  PostsListHeader,
  PostsPagination,
  PostsToolbar,
} from "./components";
import { useDeletePost, usePosts } from "./hooks";
import { type PostFilter, type PostListItem } from "./types";

// Re-export types for external use
export { POST_FILTERS, type PostFilter } from "./types";

interface PostManagerProps {
  page: number;
  filter: PostFilter;
  onPageChange: (page: number) => void;
  onFilterChange: (filter: PostFilter) => void;
}

export function PostManager({
  page,
  filter,
  onPageChange,
  onFilterChange,
}: PostManagerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostListItem | null>(null);

  // Fetch posts data
  const { posts, totalCount, totalPages, isPending, error } = usePosts({
    page,
    filter,
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
        <h1 className="text-3xl font-black font-sans uppercase text-white italic">
          Data <span className="text-zzz-lime">Logs</span>
        </h1>
        <TechButton
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "New Entry"}
        </TechButton>
      </div>

      {/* Toolbar */}
      <PostsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={onFilterChange}
        filterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
      />

      {/* List Header */}
      <PostsListHeader />

      {/* List Content */}
      {error ? (
        <ErrorPage error={error} />
      ) : isPending ? (
        <LoadingFallback />
      ) : (
        <div className="space-y-2 relative z-0">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} onDelete={handleDelete} />
          ))}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => !deleteMutation.isPending && setPostToDelete(null)}
        onConfirm={confirmDelete}
        title="CONFIRM DELETION"
        message={`Are you sure you want to delete the entry "${postToDelete?.title}"?`}
        confirmLabel="DELETE ENTRY"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
