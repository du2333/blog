import { getPostByIdFn } from "@/core/functions/posts";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { ContentRenderer } from "@/components/content-renderer";

function postQuery(id: number) {
  return queryOptions({
    queryKey: [id],
    queryFn: () => getPostByIdFn({ data: { id } }),
  });
}

export const Route = createFileRoute("/posts/$id/")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(postQuery(params.id));
  },
});

function RouteComponent() {
  const { data: post } = useSuspenseQuery(postQuery(Route.useParams().id));
  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex gap-4">
        <Link to="/" className="text-blue-500 hover:text-blue-600">
          Home
        </Link>
        <Link to="/db" className="text-blue-500 hover:text-blue-600">
          Back to DB
        </Link>
        <Link
          to="/posts/$id/edit"
          params={{ id: post.id }}
          className="text-blue-500 hover:text-blue-600"
        >
          Edit Post
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <ContentRenderer
          content={post.contentJson}
          className="ProseMirror"
        />
      </Suspense>
    </div>
  );
}
