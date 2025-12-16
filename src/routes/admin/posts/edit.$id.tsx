import { LoadingFallback } from "@/components/common/loading-fallback";
import {
  PostEditor,
  type PostEditorData,
} from "@/components/admin/posts/post-editor";
import {
  findPostByIdFn,
  updatePostFn,
} from "@/features/posts/api/posts.admin.api";
import {
  queryOptions,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/common/error-page";

const postQuery = (id: number) =>
  queryOptions({
    queryKey: ["post", id],
    queryFn: () => findPostByIdFn({ data: { id } }),
  });

export const Route = createFileRoute("/admin/posts/edit/$id")({
  ssr: false,
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const postId = Number(id);
  const queryClient = useQueryClient();
  const { data: post, isPending, error } = useQuery(postQuery(postId));

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (isPending) {
    return <LoadingFallback />;
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-black text-zzz-orange mb-2">
            POST_NOT_FOUND
          </h2>
          <p className="text-gray-500 font-mono text-sm">
            No entry found with id: {id}
          </p>
        </div>
      </div>
    );
  }

  const handleSave = async (data: PostEditorData) => {
    await updatePostFn({
      data: {
        id: post.id,
        data: {
          ...data,
          publishedAt:
            data.status === "published" && !post.publishedAt
              ? new Date()
              : data.publishedAt,
        },
      },
    });

    // Invalidate cache to ensure fresh data on next visit
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({
      predicate: (q) => q.queryKey[0] === "linkedMediaKeys",
    });
  };

  return <PostEditor initialData={post} onSave={handleSave} />;
}
