import { LoadingFallback } from "@/components/loading-fallback";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { getPostsCountFn, getPostsFn } from "@/features/posts/api/posts.api";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { POST_CATEGORIES, PostCategory } from "@/lib/db/schema";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().int().positive().optional().default(1).catch(1),
  category: z.custom<PostCategory>().optional(),
});

const postsQueryOptions = (page: number, category?: PostCategory) =>
  queryOptions({
    queryKey: ["posts", "public", page, category],
    queryFn: () =>
      getPostsFn({
        data: {
          offset: (page - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          category: category,
          publicOnly: true,
        },
      }),
  });

const postsCountQueryOptions = (category?: PostCategory) =>
  queryOptions({
    queryKey: ["postsCount", "public", category],
    queryFn: () =>
      getPostsCountFn({ data: { category: category, publicOnly: true } }),
  });

export const Route = createFileRoute("/_public/database/")({
  component: RouteComponent,
  pendingComponent: LoadingFallback,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page, category } }) => ({ page, category }),
  loader: async ({ context, deps: { page, category } }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(postsQueryOptions(page, category)),
      context.queryClient.ensureQueryData(postsCountQueryOptions(category)),
    ]);
  },
});

function RouteComponent() {
  const { page: currentPage, category } = Route.useSearch();
  const { data: paginatedPosts } = useSuspenseQuery(
    postsQueryOptions(currentPage, category)
  );
  const { data: postsCount } = useSuspenseQuery(
    postsCountQueryOptions(category)
  );
  const navigate = useNavigate();
  const totalPages = Math.ceil(postsCount / ITEMS_PER_PAGE);

  const CATEGORIES = ["ALL", ...POST_CATEGORIES] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 fill-mode-forwards duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-zzz-gray pb-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl font-black font-sans uppercase text-white mb-2">
            Database <span className="text-zzz-cyan">// Archive</span>
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            FULL ACCESS GRANTED. VIEWING RECORDS{" "}
            {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, postsCount)} OF {postsCount}
          </p>
        </div>

        <div className="flex gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = cat === "ALL" ? !category : category === cat;
            return (
              <button
                key={cat}
                className={`text-xs font-bold font-sans bg-black border px-3 py-1 transition-colors uppercase cursor-pointer ${
                  isActive
                    ? "border-zzz-lime text-zzz-lime"
                    : "border-zzz-gray text-gray-400 hover:border-zzz-lime hover:text-white"
                }`}
                onClick={() =>
                  navigate({
                    to: "/database",
                    search: {
                      page: 1,
                      category: cat === "ALL" ? undefined : cat,
                    },
                  })
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paginated List - Uses Standard List */}
      <PostList posts={paginatedPosts} />

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={(page) =>
          navigate({
            to: "/database",
            search: {
              page,
              category,
            },
          })
        }
      />
    </div>
  );
}
