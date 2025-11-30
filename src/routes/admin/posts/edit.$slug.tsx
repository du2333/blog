import { LoadingFallback } from "@/components/loading-fallback";
import { PostEditor, type PostEditorData } from "@/components/post-editor";
import {
  findPostBySlugFn,
  updatePostFn
} from "@/functions/posts";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/error-page";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: () => findPostBySlugFn({ data: { slug } }),
  });

export const Route = createFileRoute("/admin/posts/edit/$slug")({
  ssr: false,
  component: EditPost,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(postQuery(params.slug));
  },
  pendingComponent: LoadingFallback,
});

function EditPost() {
  const { slug } = Route.useParams();
  const { data: post, isPending, error } = useSuspenseQuery(postQuery(slug));

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
            No entry found with slug: {slug}
          </p>
        </div>
      </div>
    );
  }

  const handleSave = async (data: PostEditorData) => {
    await updatePostFn({
      data: {
        id: post.id,
        title: data.title,
        slug: data.slug,
        summary: data.summary || undefined,
        category: data.category,
        contentJson: data.contentJson,
        status: data.status,
        readTimeInMinutes: data.readTimeInMinutes,
        publishedAt:
          data.status === "published" && !post.publishedAt
            ? new Date()
            : data.publishedAt,
      },
    });
  };

  return (
    <PostEditor
      mode="edit"
      initialData={post}
      onSave={handleSave}
    />
  );
}
