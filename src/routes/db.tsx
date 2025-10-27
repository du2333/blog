import { createPostFn, getPostsFn } from "@/core/functions/posts";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";

const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPostsFn({ data: { offset: 0, limit: 10 } }),
});

export const Route = createFileRoute("/db")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQuery);
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: posts } = useSuspenseQuery(postsQuery);

  const createPostMutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Database Example</h1>
      <Link to="/" className="text-blue-500 hover:text-blue-600">
        Home
      </Link>

      <button
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer"
        onClick={() =>
          createPostMutation.mutate({
            data: {
              title: "Hello World",
              slug: "hello-world",
              contentJson: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Hello World" }],
                  },
                ],
              },
              status: "draft",
              publishedAt: null,
            },
          })
        }
      >
        Create Example Post
      </button>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-300 rounded-md p-4"
            >
              <h2 className="text-lg font-bold">{post.title}</h2>
              <p className="text-sm text-gray-500">
                Last Updated: {new Date(post.updatedAt).toLocaleString()}
              </p>
              <button
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer"
                onClick={() =>
                  navigate({ to: "/post/$id", params: { id: post.id } })
                }
              >
                View Post
              </button>
            </div>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
