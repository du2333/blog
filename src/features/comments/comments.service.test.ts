import { beforeEach, describe, expect, it } from "vitest";
import {
  createAdminTestContext,
  createAuthTestContext,
  createMockSession,
  seedUser,
} from "tests/test-utils";
import * as CommentService from "@/features/comments/comments.service";
import * as PostService from "@/features/posts/posts.service";

describe("CommentService", () => {
  let adminContext: ReturnType<typeof createAdminTestContext>;
  let userContext: ReturnType<typeof createAuthTestContext>;
  let postId: number;

  // 通用评论内容
  const createCommentContent = (text: string) => ({
    type: "doc" as const,
    content: [
      {
        type: "paragraph" as const,
        content: [{ type: "text" as const, text }],
      },
    ],
  });

  beforeEach(async () => {
    // Setup admin context
    adminContext = createAdminTestContext();
    await seedUser(adminContext.db, adminContext.session.user);

    // Setup normal user context
    const userSession = createMockSession({
      user: {
        id: "user-1",
        name: "Test User",
        email: "user@example.com",
        role: null,
      },
    });
    userContext = createAuthTestContext({ session: userSession });
    await seedUser(userContext.db, userSession.user);

    // Create a published post for comments
    const { id } = await PostService.createEmptyPost(adminContext);
    await PostService.updatePost(adminContext, {
      id,
      data: {
        title: "Test Post",
        status: "published",
        slug: `test-post-${Date.now()}`,
      },
    });
    postId = id;
  });

  describe("Comment Creation", () => {
    it("should create a comment with verifying status", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("Great post!"),
      });

      expect(comment.status).toBe("verifying");
      expect(comment.userId).toBe("user-1");
      expect(comment.postId).toBe(postId);
    });

    it("should trigger moderation workflow on creation", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("Nice article!"),
      });

      expect(
        userContext.env.COMMENT_MODERATION_WORKFLOW.create,
      ).toHaveBeenCalledWith({
        params: { commentId: comment.id },
      });
    });

    it("should create a reply to an existing comment", async () => {
      // Create parent comment
      const parentComment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("Parent comment"),
      });

      // Create reply
      const reply = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("Reply to parent"),
        rootId: parentComment.id,
      });

      expect(reply.rootId).toBe(parentComment.id);
      expect(reply.replyToCommentId).toBe(parentComment.id);
    });
  });

  describe("Comment Moderation", () => {
    it("should allow admin to publish a comment", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("Awaiting moderation"),
      });

      const moderatedComment = await CommentService.moderateComment(
        adminContext,
        {
          id: comment.id,
          status: "published",
        },
      );

      expect(moderatedComment.status).toBe("published");
    });

    it("should allow admin to mark a comment as pending", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("Needs review"),
      });

      // First publish the comment
      await CommentService.moderateComment(adminContext, {
        id: comment.id,
        status: "published",
      });

      // Then mark as pending for re-review
      const pendingComment = await CommentService.moderateComment(
        adminContext,
        {
          id: comment.id,
          status: "pending",
        },
      );

      expect(pendingComment.status).toBe("pending");
    });
  });

  describe("Comment Deletion", () => {
    it("should allow user to soft delete their own comment", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("My comment"),
      });

      await CommentService.deleteComment(userContext, { id: comment.id });

      const deletedComment = await CommentService.findCommentById(
        userContext,
        comment.id,
      );
      expect(deletedComment?.status).toBe("deleted");
    });

    it("should prevent user from deleting another user's comment", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("User 1's comment"),
      });

      // Create another user context
      const otherUserSession = createMockSession({
        user: {
          id: "user-2",
          name: "Other User",
          email: "other@example.com",
          role: null,
        },
      });
      const otherUserContext = createAuthTestContext({
        session: otherUserSession,
      });
      await seedUser(otherUserContext.db, otherUserSession.user);

      await expect(
        CommentService.deleteComment(otherUserContext, { id: comment.id }),
      ).rejects.toThrow("PERMISSION_DENIED");
    });

    it("should allow admin to hard delete any comment", async () => {
      const comment = await CommentService.createComment(userContext, {
        postId,
        content: createCommentContent("To be hard deleted"),
      });

      await CommentService.adminDeleteComment(adminContext, {
        id: comment.id,
      });

      const hardDeletedComment = await CommentService.findCommentById(
        adminContext,
        comment.id,
      );
      expect(hardDeletedComment).toBeFalsy();
    });
  });
});
