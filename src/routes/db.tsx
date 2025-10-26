import { createPostFn, getPostsFn, updatePostFn } from "@/core/functions/posts";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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
    <div>
      <h1 className="text-2xl font-bold">Database Example</h1>
      <Link to="/" className="text-blue-500 hover:text-blue-600">
        Home
      </Link>

      <div className="flex flex-col gap-4">
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
                contentJson: {
                  type: "doc",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Hello World" }],
                    },
                  ],
                },
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
              <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </div>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
