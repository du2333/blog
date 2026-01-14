import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminTestContext,
  createMockExecutionCtx,
  createTestContext,
  seedUser,
  waitForBackgroundTasks,
} from "tests/test-utils";
import * as TagService from "@/features/tags/tags.service";
import * as PostService from "@/features/posts/posts.service";
import * as CacheService from "@/features/cache/cache.service";

describe("TagService", () => {
  let adminContext: ReturnType<typeof createAdminTestContext>;
  let publicContext: ReturnType<typeof createTestContext>;

  beforeEach(async () => {
    adminContext = createAdminTestContext({
      executionCtx: createMockExecutionCtx(),
    });
    publicContext = createTestContext();
    await seedUser(adminContext.db, adminContext.session.user);
  });

  describe("CRUD Operations", () => {
    it("should create a tag", async () => {
      const tag = await TagService.createTag(adminContext, {
        name: "Test Tag",
      });
      expect(tag.id).toBeDefined();
      expect(tag.name).toBe("Test Tag");
    });

    it("should throw error when creating duplicate tag", async () => {
      await TagService.createTag(adminContext, { name: "Duplicate" });
      await expect(
        TagService.createTag(adminContext, { name: "Duplicate" }),
      ).rejects.toThrow("Tag name already exists");
    });

    it("should update a tag", async () => {
      const tag = await TagService.createTag(adminContext, {
        name: "Old Name",
      });
      const updated = await TagService.updateTag(adminContext, {
        id: tag.id,
        data: { name: "New Name" },
      });
      expect(updated.name).toBe("New Name");
    });

    it("should throw error when updating to existing name", async () => {
      await TagService.createTag(adminContext, { name: "Tag 1" });
      const tag2 = await TagService.createTag(adminContext, { name: "Tag 2" });

      await expect(
        TagService.updateTag(adminContext, {
          id: tag2.id,
          data: { name: "Tag 1" },
        }),
      ).rejects.toThrow("Tag name already exists");
    });

    it("should delete a tag", async () => {
      const tag = await TagService.createTag(adminContext, {
        name: "To Delete",
      });
      await TagService.deleteTag(adminContext, { id: tag.id });

      const tags = await TagService.getTags(adminContext);
      const found = tags.find((t) => t.id === tag.id);
      expect(found).toBeUndefined();
    });
  });

  describe("Data & Sorting", () => {
    it("should get tags sorted by name", async () => {
      await TagService.createTag(adminContext, { name: "B Tag" });
      await TagService.createTag(adminContext, { name: "A Tag" });

      const tags = await TagService.getTags(adminContext, {
        sortBy: "name",
        sortDir: "asc",
      });

      expect(tags[0].name).toBe("A Tag");
      expect(tags[1].name).toBe("B Tag");
    });
  });

  describe("Cache Invalidation", () => {
    it("should invalidate tag cache when tag updated", async () => {
      // 1. Setup Data
      const tag = await TagService.createTag(adminContext, {
        name: "Cache Test",
      });

      // Create and Publish Post (to make it an "affected post")
      const { id: postId } = await PostService.createEmptyPost(adminContext);
      await PostService.updatePost(adminContext, {
        id: postId,
        data: {
          title: "Tagged Post",
          slug: "tagged-post",
          status: "published",
          publishedAt: new Date(),
        },
      });

      // Assign Tag
      await TagService.setPostTags(adminContext, {
        postId,
        tagIds: [tag.id],
      });

      // DEBUG: Verify association exists and is counted as published
      const affected = await TagService.getTagsByPostId(adminContext, {
        postId,
      });
      expect(affected).toHaveLength(1);

      // We can also verify via repo if we import it, but let's assume if association exists and post is published independently, query should work.
      // Let's set publishedAt to past to avoid race condition
      await PostService.updatePost(adminContext, {
        id: postId,
        data: {
          publishedAt: new Date(Date.now() - 10000), // 10 seconds ago
        },
      });

      // Populate Cache
      await TagService.getPublicTags(publicContext);
      await waitForBackgroundTasks(publicContext.executionCtx);

      // Spy on CacheService
      const bumpSpy = vi.spyOn(CacheService, "bumpVersion");

      // Update Tag
      await TagService.updateTag(adminContext, {
        id: tag.id,
        data: { name: "Updated Cache Test" },
      });
      await waitForBackgroundTasks(adminContext.executionCtx);

      // Verify bumpVersion called
      expect(bumpSpy).toHaveBeenCalledWith(adminContext, "posts:list");
      expect(bumpSpy).toHaveBeenCalled();
    });
  });
});
