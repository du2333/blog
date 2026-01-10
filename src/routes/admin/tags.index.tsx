import { createFileRoute } from "@tanstack/react-router";
import { TagManager } from "@/features/tags/components/tag-manager";
import { tagsWithCountAdminQueryOptions } from "@/features/tags/tags.query";

export const Route = createFileRoute("/admin/tags/")({
  component: TagManagerRoute,
  loader: async ({ context }) => {
    // Prefetch tags with count for a smooth load
    await context.queryClient.prefetchQuery(tagsWithCountAdminQueryOptions());
  },
  head: () => ({
    meta: [
      {
        title: "标签管理",
      },
    ],
  }),
});

function TagManagerRoute() {
  return <TagManager />;
}
