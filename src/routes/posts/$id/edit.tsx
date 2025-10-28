import { Editor } from "@/components/editor";
import { getPostByIdFn, updatePostFn } from "@/core/functions/posts";
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

  if (!post) {
    return <div>Post not found</div>;
  }

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
      </div>

      <div className="w-full max-w-2xl mx-auto border border-gray-300 rounded-md p-4">
        <Editor
          content={post.contentJson ?? ""}
          onSave={(json) =>
            updatePostMutation.mutate({
              data: {
                ...post,
                contentJson: json,
              },
            })
          }
        />
      </div>
    </div>
  );
}
