import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userHasPasswordFn } from "@/features/auth/auth.api";
import {
  getReplyNotificationStatusFn,
  toggleReplyNotificationFn,
} from "@/features/email/email.api";
import { authClient } from "@/lib/auth/auth.client";
import { AUTH_KEYS } from "@/features/auth/queries";
import { EMAIL_KEYS } from "@/features/email/queries";

export const Route = createFileRoute("/_user/profile")({
  component: ProfilePage,
  loader: async () => {
    return {
      title: "个人资料",
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "需要当前密钥"),
    newPassword: z.string().min(8, "新密钥至少 8 位"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "密钥不匹配",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z.string().min(2, "别名至少 2 位").max(30, "别名最多 30 位"),
  image: z.union([z.literal(""), z.url("无效的 URL 地址").trim()]).optional(),
});

type PasswordSchema = z.infer<typeof passwordSchema>;
type ProfileSchema = z.infer<typeof profileSchema>;

function ProfilePage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordSchema>({
    resolver: standardSchemaResolver(passwordSchema),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileSchema>({
    resolver: standardSchemaResolver(profileSchema),
    values: {
      name: user?.name || "",
      image: user?.image || "",
    },
  });

  const { data: hasPassword } = useQuery({
    queryKey: AUTH_KEYS.hasPassword(user?.id),
    queryFn: () => userHasPasswordFn(),
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const { data: notificationStatus, isLoading: isLoadingNotification } =
    useQuery({
      queryKey: EMAIL_KEYS.replyNotification(user?.id),
      queryFn: () => getReplyNotificationStatusFn(),
      enabled: !!user,
    });

  const toggleNotificationMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      toggleReplyNotificationFn({ data: { enabled } }),
    onSuccess: (_, enabled) => {
      queryClient.setQueryData(EMAIL_KEYS.replyNotification(user?.id), {
        enabled,
      });
      toast.success(enabled ? "已开启通知" : "已关闭通知");
    },
    onError: () => {
      toast.error("操作失败，请重试");
    },
  });

  const onPasswordSubmit = async (data: PasswordSchema) => {
    const { error } = await authClient.changePassword({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      toast.error("更新失败", {
        description: error.message,
      });
      return;
    }
    toast.success("密码已更新", {
      description: "你的安全设置已同步。",
    });
    resetPassword();
  };

  const onProfileSubmit = async (data: ProfileSchema) => {
    const { error } = await authClient.updateUser({
      name: data.name,
      image: data.image,
    });
    if (error) {
      toast.error("更新失败", {
        description: error.message,
      });
      return;
    }
    toast.success("资料已更新", {
      description: `别名已更改为: ${data.name}`,
    });
  };

  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error("会话终止失败, 请稍后重试。", {
        description: error.message,
      });
      return;
    }
    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });
    toast.success("会话已终止", {
      description: "你已安全退出当前会话。",
    });
    navigate({ to: "/" });
  };

  if (!user) {
    // Should be handled by layout, but extra safety
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20 space-y-12">
      {/* Back Navigation */}
      <nav>
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={12} />
          <span>返回</span>
        </button>
      </nav>

      {/* Identity Section */}
      <section className="flex flex-col items-center text-center space-y-6">
        <div
          className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-border bg-muted/30 relative z-10"
          style={{ viewTransitionName: "user-avatar" }}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif text-5xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight">
            {user.name}
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <span>{user.role === "admin" ? "管理员" : "读者"}</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>{user.email}</span>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-border/40" />

      {/* Settings Form */}
      <section className="space-y-16 max-w-lg mx-auto">
        {/* Profile Settings */}
        <form
          onSubmit={handleSubmitProfile(onProfileSubmit)}
          className="space-y-8"
        >
          <div className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">
                昵称
              </label>
              <Input
                {...registerProfile("name")}
                className="bg-transparent border-0 border-b border-border text-foreground font-serif text-lg px-0 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/30 shadow-none"
              />
              {profileErrors.name && (
                <span className="text-[10px] text-destructive font-mono">
                  {profileErrors.name.message}
                </span>
              )}
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">
                头像 URL
              </label>
              <Input
                {...registerProfile("image")}
                className="bg-transparent border-0 border-b border-border text-foreground font-mono text-sm px-0 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/30 shadow-none"
                placeholder="https://..."
              />
              {profileErrors.image && (
                <span className="text-[10px] text-destructive font-mono">
                  {profileErrors.image.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isProfileSubmitting}
              variant="ghost"
              className="font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-transparent p-0 h-auto transition-colors"
            >
              {isProfileSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> 保存中...
                </span>
              ) : (
                "[ 保存更改 ]"
              )}
            </Button>
          </div>
        </form>

        <div className="w-full h-px bg-border/40" />

        {/* Notification Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-serif text-foreground">邮件通知</span>
            <span className="text-[10px] font-mono text-muted-foreground block">
              当有针对你评论的回复时
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={
              isLoadingNotification || toggleNotificationMutation.isPending
            }
            onClick={() =>
              toggleNotificationMutation.mutate(!notificationStatus?.enabled)
            }
            className={`
                font-mono text-xs tracking-wider h-auto px-4 py-1.5 border transition-all rounded-full
                ${
                  notificationStatus?.enabled
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/50"
                }
              `}
          >
            {notificationStatus?.enabled ? "ENABLED" : "DISABLED"}
          </Button>
        </div>

        {/* Security Section (Password) */}
        {hasPassword && (
          <div className="space-y-8 pt-4">
            <div className="space-y-1">
              <h3 className="text-sm font-serif text-foreground">安全设置</h3>
            </div>

            <form
              onSubmit={handleSubmitPassword(onPasswordSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2 group">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">
                  当前密码
                </label>
                <Input
                  type="password"
                  {...registerPassword("currentPassword")}
                  className="bg-transparent border-0 border-b border-border text-foreground font-sans text-sm px-0 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/30 shadow-none"
                />
                {passwordErrors.currentPassword && (
                  <span className="text-[10px] text-destructive font-mono">
                    {passwordErrors.currentPassword.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">
                    新密码
                  </label>
                  <Input
                    type="password"
                    {...registerPassword("newPassword")}
                    className="bg-transparent border-0 border-b border-border text-foreground font-sans text-sm px-0 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/30 shadow-none"
                  />
                  {passwordErrors.newPassword && (
                    <span className="text-[10px] text-destructive font-mono">
                      {passwordErrors.newPassword.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">
                    确认密码
                  </label>
                  <Input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className="bg-transparent border-0 border-b border-border text-foreground font-sans text-sm px-0 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/30 shadow-none"
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="text-[10px] text-destructive font-mono">
                      {passwordErrors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  variant="ghost"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-transparent p-0 h-auto transition-colors"
                >
                  {isPasswordSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /> 更新中...
                    </span>
                  ) : (
                    "[ 更新密码 ]"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Logout Action */}
        <div className="pt-12 flex justify-center">
          <Button
            variant="ghost"
            onClick={logout}
            className="font-mono text-xs text-muted-foreground/50 hover:text-destructive hover:bg-transparent tracking-widest transition-colors scale-90 hover:scale-100"
          >
            [ 退出登录 ]
          </Button>
        </div>
      </section>
    </div>
  );
}
