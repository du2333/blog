import type { DashboardResponse } from "@/features/dashboard/dashboard.schema";
import * as DashboardRepo from "@/features/dashboard/data/dashboard.data";
import * as MediaRepo from "@/features/media/data/media.data";

export async function getDashboardStats(
  context: Context,
): Promise<DashboardResponse> {
  const { db } = context;

  const [
    pendingComments,
    publishedPosts,
    drafts,
    mediaSize,
    recentComments,
    recentPosts,
    recentUsers,
  ] = await Promise.all([
    DashboardRepo.getPendingCommentsCount(db),
    DashboardRepo.getPublishedPostsCount(db),
    DashboardRepo.getDraftsCount(db),
    MediaRepo.getTotalMediaSize(db),
    DashboardRepo.getRecentComments(db),
    DashboardRepo.getRecentPosts(db),
    DashboardRepo.getRecentUsers(db),
  ]);

  const activities = [
    ...recentComments
      .filter((c) => c.posts !== null)
      .map((c) => ({
        type: "comment" as const,
        text: `用户 ${c.user?.name || "Anonymous"} 在《${c.posts!.title}》下评论了`,
        time: c.comments.createdAt,
        link: `/post/${c.posts!.slug}?highlightCommentId=${c.comments.id}&rootId=${c.comments.rootId ?? c.comments.id}#comment-${c.comments.id}`,
        rootId: c.comments.rootId ?? c.comments.id,
      })),
    ...recentPosts.map((p) => ({
      type: "post" as const,
      text: `文章《${p.title}》已发布`,
      time: p.publishedAt,
      link: `/post/${p.slug}`,
    })),
    ...recentUsers.map((u) => ({
      type: "user" as const,
      text: `新用户 ${u.name} 注册了`,
      time: u.createdAt,
    })),
  ]
    .sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 10);

  return {
    stats: {
      pendingComments,
      publishedPosts,
      drafts,
      mediaSize,
    },
    activities,
  };
}
