import { Editor } from "@/components/editor";
import { getPostByIdFn, updatePostFn } from "@/core/functions/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

const POST_ID = 1;

export const Route = createFileRoute("/editor")({
  component: RouteComponent,
  loader: async () => {
    return await getPostByIdFn({ data: { id: POST_ID } });
  },
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const post = Route.useLoaderData();
  const updatePostMutation = useMutation({
    mutationFn: updatePostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", POST_ID] });
    },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Editor Example</h1>
      <Link to="/" className="text-blue-500 hover:text-blue-600">
        Home
      </Link>
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
