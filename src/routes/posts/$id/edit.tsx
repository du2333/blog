import { Editor } from "@/components/editor";
import {
  getPostByIdFn,
  publishPostFn,
  updatePostFn,
} from "@/core/functions/posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const id = Route.useParams().id;
  const { data: post } = useQuery({
    queryKey: [id],
    queryFn: () => getPostByIdFn({ data: { id } }),
  });
  const updatePostMutation = useMutation({
    mutationFn: updatePostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id] });
    },
  });
  const publishPostMutation = useMutation({
    mutationFn: publishPostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id] });
    },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  const handlePublish = async () => {
    await publishPostMutation.mutateAsync({
      data: { id: post.id },
    });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Editor Example</h1>
      <div className="flex gap-4">
        <Link to="/" className="text-blue-500 hover:text-blue-600">
          Home
        </Link>
        <Link
          to={`/posts/$id`}
          params={{ id: post.id }}
          className="text-blue-500 hover:text-blue-600"
        >
          View Post
        </Link>
        <Link to="/db" className="text-blue-500 hover:text-blue-600">
          Back to DB
        </Link>
        <button
          onClick={handlePublish}
          disabled={publishPostMutation.isPending}
          className="ml-auto rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {publishPostMutation.isPending ? "发布中..." : "发布"}
        </button>
      </div>

      <Editor
        content={post.contentJson ?? ""}
        onSave={async (json) =>
          updatePostMutation.mutateAsync({
            data: {
              id: post.id,
              contentJson: json,
            },
          })
        }
      />
    </div>
  );
}
