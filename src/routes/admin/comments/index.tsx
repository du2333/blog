import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { CommentStatus } from "@/lib/db/schema";
import { CommentModerationTable } from "@/features/comments/components/admin/comment-moderation-table";

const searchSchema = z.object({
  status: z
    .enum(["pending", "published", "deleted", "verifying", "ALL"])
    .optional()
    .default("ALL")
    .catch("ALL"),
});

export const Route = createFileRoute("/admin/comments/")({
  validateSearch: searchSchema,
  component: CommentAdminPage,
  head: () => ({
    meta: [
      {
        title: "评论管理",
      },
    ],
  }),
});

function CommentAdminPage() {
  const { status } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleStatusChange = (newStatus: string) => {
    navigate({
      search: (prev) => ({ ...prev, status: newStatus as any }),
    });
  };

  const currentStatus: CommentStatus | undefined =
    status === "ALL" ? undefined : status;

  const filterItems = [
    { key: "ALL", label: "全部" },
    { key: "verifying", label: "审核中" },
    { key: "pending", label: "待人工" },
    { key: "published", label: "已发布" },
    { key: "deleted", label: "已拒绝" },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight">
            评论管理
          </h1>
        </div>
      </div>

      <div className="animate-in fade-in duration-1000 delay-100 fill-mode-both space-y-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mr-2">
              状态筛选
            </span>
            <div className="flex bg-accent/20 p-1 rounded-sm border border-border/50">
              {filterItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleStatusChange(item.key)}
                  className={`
                    px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all duration-300
                    ${
                      status === item.key
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <CommentModerationTable status={currentStatus} />
      </div>
    </div>
  );
}
