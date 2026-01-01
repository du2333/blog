import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  checkMediaInUseFn,
  deleteImageFn,
  getLinkedMediaKeysFn,
  getMediaFn,
  getTotalMediaSizeFn,
  updateMediaNameFn,
} from "@/features/media/images.api";
import { useDebounce } from "@/hooks/use-debounce";

export function useMediaLibrary() {
  const queryClient = useQueryClient();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Track previous search to detect changes
  const [prevSearchQuery, setPrevSearchQuery] = useState("");

  // Selection & Deletion State (使用 key 作为唯一标识)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [deleteTarget, setDeleteTarget] = useState<Array<string> | null>(null);

  // Infinite Query for media list
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["media", debouncedSearch],
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

  // Flatten all pages into a single array
  const mediaItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  // Get all visible media keys
  const mediaKeys = useMemo(() => mediaItems.map((m) => m.key), [mediaItems]);

  // Stable query key for linked media; use joined keys to avoid referential changes
  const linkedQueryKey = useMemo(
    () => ["linkedMediaKeys", mediaKeys.join("|")],
    [mediaKeys],
  );

  // Query linked status for visible media items
  const { data: linkedKeysData } = useQuery({
    queryKey: linkedQueryKey,
    queryFn: () => getLinkedMediaKeysFn({ data: { keys: mediaKeys } }),
    enabled: mediaKeys.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: totalMediaSize } = useQuery({
    queryKey: ["media", "totalSize"],
    queryFn: () => getTotalMediaSizeFn(),
  });

  // Build linkedMediaIds set
  const linkedMediaIds = useMemo(() => {
    return new Set(linkedKeysData ?? []);
  }, [linkedKeysData]);

  // Clear selections when debounced search changes (actual data refresh)
  useEffect(() => {
    if (debouncedSearch !== prevSearchQuery) {
      setSelectedKeys(new Set());
      setDeleteTarget(null);
      setPrevSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, prevSearchQuery]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (keys: Array<string>) => {
      // 逐个删除
      for (const key of keys) {
        await deleteImageFn({ data: { key } });
      }
      return keys; // 返回 keys 以便在 onSuccess 中使用
    },
    onSuccess: (deletedKeys) => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ["media"] });
      // 清除选择
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        deletedKeys.forEach((key) => next.delete(key));
        return next;
      });
      setDeleteTarget(null);
      toast.success("资源已永久删除", {
        description: `${deletedKeys.length} 个项目已从存储中永久删除。`,
      });
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: error.message,
      });
    },
  });

  // Update name mutation
  const updateAsset = useMutation({
    mutationFn: updateMediaNameFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("资源元数据已更新", {
        description: `元数据更改已保存。`,
      });
    },
    onError: (error) => {
      toast.error("更新元数据失败", {
        description: error.message,
      });
    },
  });

  // Load more handler - memoized to prevent IntersectionObserver recreation
  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Selection handlers
  const toggleSelection = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedKeys.size === mediaItems.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(mediaItems.map((m) => m.key)));
    }
  };

  // Request delete - check if any assets are in use
  const requestDelete = async (keys: Array<string>) => {
    const blockedKeys: Array<string> = [];
    const allowedKeys: Array<string> = [];

    // 检查每个资源是否被使用
    for (const key of keys) {
      const inUse = await checkMediaInUseFn({ data: { key } });
      if (inUse) {
        blockedKeys.push(key);
      } else {
        allowedKeys.push(key);
      }
    }

    if (blockedKeys.length > 0) {
      toast.warning("检测到受保护的资源", {
        description: `${blockedKeys.length} 个项目当前正在被文章使用，无法删除。`,
      });
    }

    if (allowedKeys.length > 0) {
      setDeleteTarget(allowedKeys);
    } else {
      // Clear any stale deleteTarget when all keys are blocked
      setDeleteTarget(null);
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  return {
    mediaItems,
    totalCount: mediaItems.length,
    searchQuery,
    setSearchQuery,
    selectedIds: selectedKeys, // 保持接口兼容
    toggleSelection,
    selectAll,
    deleteTarget,
    isDeleting: deleteMutation.isPending,
    requestDelete,
    confirmDelete,
    cancelDelete,
    refetch,
    loadMore,
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    isPending,
    linkedMediaIds,
    totalMediaSize,
    updateAsset,
  };
}
