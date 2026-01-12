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
  loader: () => {
    return {
      title: "评论管理",
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
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
      search: (prev) => ({
        ...prev,
        status: newStatus as CommentStatus | "ALL",
        page: 1,
      }),
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
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-foreground">
            评论管理
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
            管理 / 审核 / 社区
          </p>
        </div>

        {/* User Search */}
        <div className="relative w-full md:w-72 group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="搜索用户昵称..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10 border-none! bg-muted/30 hover:bg-muted/50 focus:bg-background transition-all rounded-none! font-mono text-xs ring-offset-background focus-visible:ring-1 focus-visible:ring-border"
          />
          <div className="absolute bottom-0 left-0 w-full h-px bg-border group-focus-within:bg-primary transition-all" />
        </div>
      </header>

      <div className="space-y-10">
        {/* Navigation & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/50 pb-px">
          <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={`
                  relative pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap
                  ${
                    status === tab.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }
                `}
              >
                {tab.label}
                {status === tab.key && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-left-2 duration-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area - Minimal background, focus on content */}
        <div className="min-h-[400px]">
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
