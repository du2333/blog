import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import * as CommentService from "@/features/comments/comments.service";
import * as CommentRepo from "@/features/comments/data/comments.data";
import * as AiService from "@/features/ai/ai.service";
import * as PostService from "@/features/posts/posts.service";
import { getDb } from "@/lib/db";
import { convertToPlainText } from "@/features/posts/utils/content";
import { serverEnv } from "@/lib/env/server.env";

interface Params {
  commentId: number;
}

export class CommentModerationWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { commentId } = event.payload;

    // Step 1: Fetch the comment
    const comment = await step.do("fetch comment", async () => {
      const db = getDb(this.env);
      return await CommentService.findCommentById({ db }, commentId);
    });

    if (!comment) {
      console.log(`Comment ${commentId} not found, skipping moderation`);
      return;
    }

    // Skip if comment is already processed or deleted
    if (comment.status !== "verifying") {
      console.log(
        `Comment ${commentId} is already processed (status: ${comment.status}), skipping`,
      );
      return;
    }

    const post = await step.do("fetch post", async () => {
      const db = getDb(this.env);
      return await PostService.findPostById({ db }, { id: comment.postId });
    });

    if (!post) {
      console.log(`Post ${comment.postId} not found, skipping moderation`);
      return;
    }

    // Extract plain text from JSONContent
    const plainText = convertToPlainText(comment.content);

    if (!plainText || plainText.trim().length === 0) {
      // Empty comment, mark as pending for manual review
      await step.do("mark empty comment as pending", async () => {
        const db = getDb(this.env);
        await CommentService.updateCommentStatus(
          { db },
          commentId,
          "pending",
          "评论内容为空，需人工审核",
        );
      });
      return;
    }

    // Step 2: Call AI to moderate the content
    const moderationResult = await step.do(
      `moderate comment ${commentId}`,
      {
        retries: {
          limit: 3,
          delay: "5 seconds",
          backoff: "exponential",
        },
      },
      async () => {
        if (serverEnv(this.env).ENVIRONMENT === "dev") {
          return {
            safe: true,
            reason: "开发环境，自动通过",
          };
        }
        try {
          return await AiService.moderateComment(
            { env: this.env },
            {
              comment: plainText,
              post: {
                title: post.title,
                summary: post.summary ?? "",
              },
            },
          );
        } catch (error) {
          // If AI service is not configured, mark as pending for manual review
          console.error("AI moderation failed:", error);
          return {
            safe: false,
            reason: "AI 审核服务暂时不可用，等待人工审核",
          };
        }
      },
    );

    // Step 3: Update comment status based on moderation result
    await step.do("update comment status", async () => {
      const db = getDb(this.env);

      if (moderationResult.safe) {
        await CommentService.updateCommentStatus(
          { db },
          commentId,
          "published",
          moderationResult.reason,
        );
      } else {
        await CommentService.updateCommentStatus(
          { db },
          commentId,
          "pending",
          moderationResult.reason,
        );
      }
    });

    // Step 4: Send reply notification if comment was approved and is a reply
    if (moderationResult.safe && comment.replyToCommentId) {
      await step.do("send reply notification", async () => {
        const db = getDb(this.env);

        // Get the author of the comment being replied to
        const replyToAuthor = await CommentRepo.getCommentAuthorWithEmail(
          db,
          comment.replyToCommentId!,
        );

        if (!replyToAuthor || !replyToAuthor.email) {
          console.log(
            `[CommentModerationWorkflow] Reply-to author not found or no email, skipping notification`,
          );
          return;
        }

        // Don't notify if replying to own comment
        if (replyToAuthor.id === comment.userId) {
          console.log(
            `[CommentModerationWorkflow] Self-reply, skipping notification`,
          );
          return;
        }

        // Get replier info
        const replier = await CommentRepo.getCommentAuthorWithEmail(
          db,
          commentId,
        );
        const replierName = replier?.name ?? "有人";

        const replyPreview = convertToPlainText(comment.content).slice(0, 100);

        await this.env.SEND_EMAIL_WORKFLOW.create({
          params: {
            to: replyToAuthor.email,
            subject: `[评论回复] ${replierName} 回复了您在《${post.title}》的评论`,
            html: `
              <p><strong>${replierName}</strong> 回复了您的评论：</p>
              <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
                ${replyPreview}${replyPreview.length >= 100 ? "..." : ""}
              </blockquote>
              <p><a href="https://blog.dukda.com/post/${post.slug}">查看完整回复</a></p>
            `,
          },
        });

        console.log(
          `[CommentModerationWorkflow] Reply notification sent to ${replyToAuthor.email}`,
        );
      });
    }
  }
}
