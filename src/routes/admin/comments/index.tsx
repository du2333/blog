import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import type { CommentStatus } from "@/lib/db/schema";
import { CommentModerationTable } from "@/features/comments/components/admin/comment-moderation-table";
import { Input } from "@/components/ui/input";

const searchSchema = z.object({
  status: z
    .enum(["pending", "published", "deleted", "verifying", "ALL"])
    .optional()
    .default("pending")
    .catch("pending"),
  userName: z.string().optional(),
  page: z.number().optional().default(1).catch(1),
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
  const { status, userName, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchInput, setSearchInput] = useState(userName || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== userName) {
        navigate({
          search: (prev) => ({
            ...prev,
            userName: searchInput || undefined,
            page: 1, // Reset page on search
          }),
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, navigate, userName]);

  const handleStatusChange = (newStatus: string) => {
    navigate({
      search: (prev) => ({ ...prev, status: newStatus as any, page: 1 }),
    });
  };

  const currentStatus: CommentStatus | undefined =
    status === "ALL" ? undefined : status;

  const tabs = [
    { key: "pending", label: "待审核" },
    { key: "published", label: "已发布" },
    { key: "deleted", label: "垃圾箱" },
    { key: "ALL", label: "全部记录" },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-medium tracking-tight">
            评论管理
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            管理所有评论，审核风险内容，查看用户发言记录。
          </p>
        </div>

        {/* User Search */}
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜索用户昵称..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-10 border-border/50 bg-background/50 focus:bg-background transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="animate-in fade-in duration-1000 delay-100 fill-mode-both space-y-6">
        {/* Tabs */}
        <div className="border-b border-border/50">
          <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={`
                  relative pb-4 text-sm font-medium transition-all whitespace-nowrap
                  ${
                    status === tab.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }
                `}
              >
                {tab.label}
                {status === tab.key && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full transition-all" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl">
          <CommentModerationTable
            status={currentStatus}
            userName={userName}
            page={page}
          />
        </div>
      </div>
    </div>
  );
}
