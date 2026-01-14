---
name: frontend-development
description: Frontend development patterns for the Flare Stack Blog. Use when implementing data fetching with TanStack Query, creating route loaders, building infinite scroll, adding skeleton/pending states, or organizing UI components.
---

# Frontend Development Patterns

This skill covers TanStack Query patterns, route loaders, component organization, and frontend best practices.

## Data Fetching Architecture

The project follows **TanStack Start / TanStack Query** standard practices for seamless SSR and client-side caching.

### 1. Query Definition (`[name].query.ts`)

Centralize TanStack Query configurations using `queryOptions` and `infiniteQueryOptions` factories:

```typescript
// posts.query.ts
import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { findPostBySlugFn, getPostsFn } from "./posts.api";

export function postBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["post", slug],
    queryFn: () => findPostBySlugFn({ data: { slug } }),
  });
}

export function postsInfiniteQuery(tag?: string) {
  return infiniteQueryOptions({
    queryKey: ["posts", { tag }],
    queryFn: ({ pageParam }) =>
      getPostsFn({ data: { cursor: pageParam, tag } }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
}
```

### 2. Route Loader (`routes/<path>.tsx`)

Use loader functions with `ensureQueryData()` or `prefetchQuery()` for SSR:

```typescript
// $slug.tsx
export const Route = createFileRoute("/_public/post/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(
      postBySlugQuery(params.slug),
    );
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData: post }) => ({
    meta: [{ title: post?.title }],
  }),
  component: PostPage,
});
```

**Key Points**:

- `ensureQueryData()`: Fetches and caches if not present
- `prefetchQuery()` / `prefetchInfiniteQuery()`: For background prefetching
- `loaderData`: Available in `head` function for dynamic SEO

### 3. Component Data Access

Use `useSuspenseQuery` or `useSuspenseInfiniteQuery` in components. Since loaders prefetch, this is typically synchronous:

```typescript
function PostComponent() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postBySlugQuery(slug));

  return <article>{post.content}</article>;
}
```

### 4. Infinite Scroll Pattern

Use `IntersectionObserver` to observe a bottom sentinel element:

```typescript
function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(postsInfiniteQuery());

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      {data.pages.flatMap((page) => page.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      )))}

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && <LoadingSpinner />}
    </>
  );
}
```

## Skeleton / Pending States

Define `pendingComponent` for critical routes to show skeletons during client navigation:

```typescript
export const Route = createFileRoute("/_public/post/$slug")({
  pendingComponent: PostSkeleton,
  // ...
});

function PostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-3/4 mb-4" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  );
}
```

## Component Organization

### `src/components/` Directory

| Subdirectory | Purpose                                                             |
| :----------- | :------------------------------------------------------------------ |
| `ui/`        | Atomic UI components (Button, Input, Card). Use `cva` for variants. |
| `common/`    | Shared business components (ThemeProvider, LoadingFallback)         |
| `layout/`    | Layout components (Header, Footer, Sidebar)                         |

### Feature Components

Components specific to a feature belong in `features/<name>/components/`.

## Custom Hooks (`src/hooks/`)

Reusable hooks for cross-feature functionality:

| Hook                   | Purpose                        |
| :--------------------- | :----------------------------- |
| `use-debounce.ts`      | Generic debouncing             |
| `use-media-query.ts`   | Responsive media queries       |
| `use-navigate-back.ts` | Navigation with fallback       |
| `use-active-toc.ts`    | Table of contents active state |

## Naming Conventions

| Type                  | Convention       | Example                            |
| :-------------------- | :--------------- | :--------------------------------- |
| Components & Hooks    | kebab-case files | `post-item.tsx`, `use-debounce.ts` |
| React Components      | PascalCase       | `PostItem`                         |
| Variables & Functions | camelCase        | `getPosts`                         |
| Types & Interfaces    | PascalCase       | `PostItemProps`                    |
