import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/posts")({
  component: RouteComponent,
  loader: () => ({
    title: "文章管理",
  }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
    ],
  }),
});

function RouteComponent() {
  return <Outlet />;
}
