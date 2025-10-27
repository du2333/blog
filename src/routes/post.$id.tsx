import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPostByIdFn } from "@/core/functions/posts";
import { z } from "zod";
import { Suspense } from "react";
import { Link } from "@tanstack/react-router";

function postQuery(id: number) {
  return queryOptions({
    queryKey: [id],
    queryFn: () => getPostByIdFn({ data: { id } }),
  });
}
export const Route = createFileRoute("/post/$id")({
  params: {
    parse: (params) => ({
      id: z.coerce.number().int().positive().parse(params.id),
    }),
  },
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
          to="/post/$id/edit"
          params={{ id: post.id }}
          className="text-blue-500 hover:text-blue-600"
        >
          Edit Post
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </Suspense>
    </div>
  );
}
