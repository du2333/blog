import { useCanGoBack, useRouter } from "@tanstack/react-router";
import type { FileRoutesByTo } from "@/routeTree.gen";

interface UseNavigateBackOptions {
  /**
   * Fallback URL when history is not available.
   * Defaults to ".." (parent route).
   */
  fallbackTo?: keyof FileRoutesByTo;
}

/**
 * Hook that provides a back navigation function with fallback.
 * If history is available, it goes back in history.
 * Otherwise, it navigates to the fallback URL (defaults to parent route).
 */
export function useNavigateBack(options: UseNavigateBackOptions = {}) {
  const { fallbackTo = ".." } = options;
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return () => {
    if (canGoBack) {
      router.history.back();
    } else {
      router.navigate({ to: fallbackTo });
    }
  };
}
