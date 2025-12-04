import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMediaFn } from "@/functions/images";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Simplified media hook for the insert modal (no delete/selection logic)
 */
export const useMediaPicker = () => {
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Infinite Query for media list (images only)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["media-picker", debouncedSearch],
      queryFn: ({ pageParam }) =>
        getMediaFn({
          data: {
            cursor: pageParam,
            search: debouncedSearch || undefined,
          },
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as number | undefined,
    });

  // Flatten all pages and filter to images only
  const mediaItems = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];
    return items.filter((m) => m.mimeType.startsWith("image/"));
  }, [data]);

  // Load more handler
  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return {
    mediaItems,
    searchQuery,
    setSearchQuery,
    loadMore,
    hasMore: hasNextPage ?? false,
    isLoadingMore: isFetchingNextPage,
    isPending,
  };
};
