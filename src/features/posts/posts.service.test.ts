import { beforeEach, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import {
  createAdminTestContext,
  seedUser,
  waitForBackgroundTasks,
} from "tests/test-utils";
import * as PostService from "@/features/posts/posts.service";
import * as CacheService from "@/features/cache/cache.service";

describe("PostService", () => {
  let adminContext: ReturnType<typeof createAdminTestContext>;

  beforeEach(async () => {
    adminContext = createAdminTestContext();
    await seedUser(adminContext.db, adminContext.session.user);
  });

  describe("Post CRUD", () => {
    it("should create an empty draft post", async () => {
      const { id } = await PostService.createEmptyPost(adminContext);
      expect(id).toBeDefined();

      const post = await PostService.findPostById(adminContext, { id });
      expect(post).not.toBeNull();
      expect(post?.status).toBe("draft");
      expect(post?.title).toBe("");
    });

    it("should update a post with content", async () => {
      const { id } = await PostService.createEmptyPost(adminContext);

      const updatedPost = await PostService.updatePost(adminContext, {
        id,
        data: {
          title: "Updated Title",
          slug: "updated-title",
          contentJson: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Hello World" }],
              },
            ],
          },
          status: "published",
          publishedAt: new Date(),
        },
      });

      expect(updatedPost).not.toBeNull();
      expect(updatedPost!.title).toBe("Updated Title");
      expect(updatedPost!.slug).toBe("updated-title");
      expect(updatedPost!.status).toBe("published");
    });

    it("should find a published post by slug", async () => {
      const { id } = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id,
        data: {
          title: "Public Post",
          slug: "public-post",
          status: "published",
          publishedAt: new Date(),
        },
      });

      // 等待 waitUntil 完成（缓存写入）
      await waitForBackgroundTasks(adminContext.executionCtx);

      const post = await PostService.findPostBySlug(adminContext, {
        slug: "public-post",
      });

      expect(post).not.toBeNull();
      expect(post?.id).toBe(id);
      expect(post?.title).toBe("Public Post");
    });

    it("should delete a post", async () => {
      const { id } = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id,
        data: { title: "To Delete", slug: "to-delete" },
      });

      await PostService.deletePost(adminContext, { id });

      const deletedPost = await PostService.findPostById(adminContext, { id });
      expect(deletedPost).toBeNull();
    });
  });

  describe("Slug Generation", () => {
    it("should generate a unique slug when there is a collision", async () => {
      const post1 = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id: post1.id,
        data: { title: "Collision", slug: "collision" },
      });

      const { slug } = await PostService.generateSlug(adminContext, {
        title: "Collision",
      });

      expect(slug).toBe("collision-1");
    });

    it("should generate incrementing slugs for multiple collisions", async () => {
      const post1 = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id: post1.id,
        data: { title: "Test", slug: "test" },
      });

      const post2 = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id: post2.id,
        data: { title: "Test", slug: "test-1" },
      });

      const { slug } = await PostService.generateSlug(adminContext, {
        title: "Test",
      });

      expect(slug).toBe("test-2");
    });
  });

  describe("Cache Behavior", () => {
    it("should cache post by slug after first fetch", async () => {
      const { id } = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id,
        data: {
          title: "Cached Post",
          slug: "cached-post",
          status: "published",
          publishedAt: new Date(),
        },
      });

      // First fetch - cache MISS
      const post1 = await PostService.findPostBySlug(adminContext, {
        slug: "cached-post",
      });
      expect(post1).not.toBeNull();

      // 等待缓存写入完成
      await waitForBackgroundTasks(adminContext.executionCtx);

      // 验证 KV 中有缓存数据 (key 格式: version:post:slug)
      const version = await CacheService.getVersion(
        adminContext,
        "posts:detail",
      );
      const cacheKey = `${version}:post:cached-post`;
      const cachedData = await env.KV.get(cacheKey, "json");
      expect(cachedData).not.toBeNull();
    });

    it("should invalidate cache when version is bumped", async () => {
      const { id } = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id,
        data: {
          title: "Version Test",
          slug: "version-test",
          status: "published",
          publishedAt: new Date(),
        },
      });

      // First fetch to populate cache
      await PostService.findPostBySlug(adminContext, { slug: "version-test" });
      await waitForBackgroundTasks(adminContext.executionCtx);

      // Get current version (implicit v1 before any bump)
      const oldVersion = await CacheService.getVersion(
        adminContext,
        "posts:detail",
      );
      expect(oldVersion).toBe("v1");

      // Bump version twice to go from implicit v1 -> v1 (stored) -> v2
      await CacheService.bumpVersion(adminContext, "posts:detail");
      await CacheService.bumpVersion(adminContext, "posts:detail");

      // Verify version changed
      const newVersion = await CacheService.getVersion(
        adminContext,
        "posts:detail",
      );
      expect(newVersion).toBe("v2");

      // New cache key doesn't exist yet (old one is stale)
      const newCacheKey = `${newVersion}:post:version-test`;
      const newCachedData = await env.KV.get(newCacheKey, "json");
      expect(newCachedData).toBeNull();
    });

    it("should use isolated storage for each test", async () => {
      // Verify KV is clean at the start of this test
      const version = await CacheService.getVersion(
        adminContext,
        "posts:detail",
      );
      // Should be v1 since each test has isolated storage
      expect(version).toBe("v1");
    });
  });
});
