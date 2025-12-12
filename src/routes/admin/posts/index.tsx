import { PostManager, POST_FILTERS } from "@/components/admin/posts/post-manager";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().int().positive().optional().default(1).catch(1),
  filter: z.enum(POST_FILTERS).optional().default("ALL").catch("ALL"),
});

export const Route = createFileRoute("/admin/posts/")({
  validateSearch: searchSchema,
  component: PostManagerPage,
});

function PostManagerPage() {
  const navigate = useNavigate();
  const { page, filter } = Route.useSearch();

  const handlePageChange = (newPage: number) => {
    navigate({
      to: "/admin/posts",
      search: { page: newPage, filter },
    });
  };

  const handleFilterChange = (newFilter: (typeof POST_FILTERS)[number]) => {
    navigate({
      to: "/admin/posts",
      search: { page: 1, filter: newFilter },
    });
  };

  return (
    <PostManager
      page={page}
      filter={filter}
      onPageChange={handlePageChange}
      onFilterChange={handleFilterChange}
    />
  );
}
