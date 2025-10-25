import { createPostFn, getPostsFn, updatePostFn } from "@/core/functions/posts";
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";

const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPostsFn({ data: { offset: 0, limit: 10 } }),
});

export const Route = createFileRoute("/")({
  component: App,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQuery);
  },
});

function App() {
  const queryClient = useQueryClient();
  const { data: posts } = useSuspenseQuery(postsQuery);

  const createPostMutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const updatePostMutation = useMutation({
    mutationFn: updatePostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Hello World 2</h1>
      <Link to="/example" className="hover:underline text-2xl">
        Go to /Example
      </Link>
      <div className="flex flex-col gap-4">
        <button
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer"
          onClick={() =>
            createPostMutation.mutate({
              data: {
                title: "Hello World",
                slug: "hello-world",
                contentHtml: "Hello World",
                status: "draft",
                publishedAt: null,
              },
            })
          }
        >
          Create Example Post
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer"
          onClick={() =>
            updatePostMutation.mutate({
              data: {
                id: 1,
                title: `Hello World ${Math.random()}`,
                slug: "hello-world",
                contentHtml: "Hello World",
                status: "draft",
                publishedAt: null,
              },
            })
          }
        >
          Update Example Post
        </button>
      </div>
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
            </div>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
