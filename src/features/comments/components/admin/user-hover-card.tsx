import { queryOptions, useQuery } from "@tanstack/react-query";
import { Calendar, MessageSquare, ShieldAlert } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserStatsFn } from "@/features/comments/api/comments.admin.api";
import { formatDate } from "@/lib/utils";

// Query option for user stats
const userStatsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["admin", "user-stats", userId],
    queryFn: () => getUserStatsFn({ data: { userId } }),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

interface UserHoverCardProps {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  children: React.ReactNode;
}

export function UserHoverCard({ user, children }: UserHoverCardProps) {
  const { data: stats, isLoading } = useQuery({
    ...userStatsQuery(user.id),
    enabled: !!user.id,
  });

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden" align="start">
        <div className="bg-muted/30 p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">{user.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">
                {user.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <Calendar size={12} />
              <span>注册时间</span>
            </div>
            <p className="text-sm font-mono">
              {isLoading || !stats ? "..." : formatDate(stats.registeredAt)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <MessageSquare size={12} />
              <span>历史评论</span>
            </div>
            <p className="text-sm font-mono">
              {isLoading || !stats ? "..." : stats.totalComments}
            </p>
          </div>

          <div className="col-span-2 space-y-1 pt-2 border-t border-border/50 mt-2">
            <div className="flex items-center gap-2 text-xs text-red-500/80 uppercase tracking-wider">
              <ShieldAlert size={12} />
              <span>违规/被删记录</span>
            </div>
            <p className="text-sm font-mono text-red-500">
              {isLoading || !stats ? "..." : stats.rejectedComments} 条记录
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
