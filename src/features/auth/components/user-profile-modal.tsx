import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Loader2,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userHasPasswordFn } from "@/features/auth/auth.api";
import { authClient } from "@/lib/auth/auth.client";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  logout: () => Promise<void>;
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role?: string | null;
  };
}

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

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  logout,
}: UserProfileModalProps) {
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
    queryKey: ["user-has-password", user?.id],
    queryFn: () => userHasPasswordFn(),
    enabled: !!user,
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

  if (!user) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 transition-all duration-500 ease-in-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
            relative w-full max-w-5xl bg-background shadow-2xl border border-border
            flex flex-col md:flex-row overflow-hidden rounded-sm
            max-h-[90vh] transition-all duration-500 ease-in-out transform fill-mode-both
            ${
              isOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-8 scale-[0.99] opacity-0"
            }
        `}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-8 right-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent hover:bg-transparent"
        >
          <X size={24} strokeWidth={1.5} />
        </Button>

        {/* Left: Identity Summary */}
        <div className="w-full md:w-[380px] p-12 md:p-20 flex flex-col border-b md:border-b-0 md:border-r border-border bg-muted/30">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden transition-all duration-1000 border border-border p-1">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                    <UserIcon size={40} strokeWidth={1} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-serif font-medium tracking-tight">
                  {user.name}
                </h2>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em]">
                  {user.role === "admin" ? "管理员" : "用户"}
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-12 border-t border-border">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-30">
                  状态
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-sm font-light">在线</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-30">
                  邮箱
                </span>
                <div className="text-sm font-light opacity-60">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-20">
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                onClose();
              }}
              className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-zinc-400 hover:text-red-500 transition-colors h-auto p-0 bg-transparent hover:bg-transparent"
            >
              <span>退出登录</span>
              <LogOut
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>

        {/* Right: Detailed Settings */}
        <div className="flex-1 p-8 md:p-16 space-y-20 overflow-y-auto custom-scrollbar">
          {/* Profile Configuration */}
          <section className="space-y-12">
            <header className="space-y-4">
              <h3 className="text-3xl font-serif font-medium tracking-tight">
                资料设置
              </h3>
            </header>

            <form
              onSubmit={handleSubmitProfile(onProfileSubmit)}
              className="space-y-10 max-w-xl"
            >
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 pl-1">
                  用户昵称
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    {...registerProfile("name")}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-4 text-xl font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all shadow-none px-0"
                  />
                  {profileErrors.name && (
                    <span className="text-[9px] text-red-500 font-mono uppercase mt-2 block tracking-wider">
                      {profileErrors.name.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 pl-1">
                  头像链接
                </label>
                <div className="flex gap-4 md:gap-8 items-end">
                  <Input
                    type="text"
                    {...registerProfile("image")}
                    className="flex-1 min-w-0 bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-4 text-xl font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all shadow-none px-0"
                  />
                  <Button
                    type="submit"
                    disabled={isProfileSubmitting}
                    size="icon"
                    variant="outline"
                    className="mb-2 w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 shrink-0"
                  >
                    {isProfileSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                  </Button>
                </div>
                {profileErrors.image && (
                  <span className="text-[9px] text-red-500 font-mono uppercase mt-2 block tracking-wider">
                    {profileErrors.image.message}
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* Security Protocol */}
          <section className="space-y-10 pb-12">
            <header className="space-y-4">
              <h3 className="text-3xl font-serif font-medium tracking-tight">
                修改密码
              </h3>
            </header>

            {hasPassword ? (
              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-10 max-w-2xl"
              >
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 pl-1">
                      当前密码
                    </label>
                    <Input
                      type="password"
                      {...registerPassword("currentPassword")}
                      className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-4 text-xl font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all shadow-none px-0"
                    />
                    {passwordErrors.currentPassword && (
                      <span className="text-[9px] text-red-500 font-mono uppercase mt-2 block tracking-wider">
                        {passwordErrors.currentPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 pl-1">
                        新密码
                      </label>
                      <Input
                        type="password"
                        {...registerPassword("newPassword")}
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-4 text-xl font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all shadow-none px-0"
                      />
                      {passwordErrors.newPassword && (
                        <span className="text-[9px] text-red-500 font-mono uppercase mt-2 block tracking-wider">
                          {passwordErrors.newPassword.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 pl-1">
                        确认新密码
                      </label>
                      <div className="flex gap-4 items-end">
                        <Input
                          type="password"
                          {...registerPassword("confirmPassword")}
                          className="flex-1 min-w-0 bg-transparent border-t-0 border-x-0 border-b border-border rounded-none py-4 text-xl font-light focus-visible:ring-0 focus:border-foreground focus:outline-none transition-all shadow-none px-0"
                        />
                        <Button
                          type="submit"
                          disabled={isPasswordSubmitting}
                          size="icon"
                          variant="outline"
                          className="mb-2 w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 shrink-0"
                        >
                          {isPasswordSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                        </Button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <span className="text-[9px] text-red-500 font-mono uppercase mt-2 block tracking-wider">
                          {passwordErrors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-10 border border-border bg-muted/30 space-y-6 max-w-2xl">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <ShieldAlert size={24} strokeWidth={1.5} />
                  <span className="text-xs font-medium uppercase tracking-[0.2em]">
                    外部账户
                  </span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed italic">
                  此账户通过第三方提供商（如 Github）登录。
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
