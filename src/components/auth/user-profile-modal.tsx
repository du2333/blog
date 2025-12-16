import TechButton from "@/components/ui/tech-button";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";
import { authClient } from "@/lib/auth/auth.client";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Check,
  Fingerprint,
  Key,
  Link,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Shield,
  ShieldAlert,
  UserCog,
  User as UserIcon,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { userHasPasswordFn } from "@/features/auth/auth.api";
import { useQuery } from "@tanstack/react-query";

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
    currentPassword: z.string().min(1, "CURRENT_KEY_REQUIRED"),
    newPassword: z.string().min(8, "NEW_KEY_TOO_WEAK (至少 8 位)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "KEY_MISMATCH",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "ALIAS_TOO_SHORT (至少 2 位)")
    .max(30, "ALIAS_TOO_LONG (最多 30 位)"),
  image: z.union([z.literal(""), z.url("INVALID_URL").trim()]).optional(),
});

type PasswordSchema = z.infer<typeof passwordSchema>;
type ProfileSchema = z.infer<typeof profileSchema>;

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  logout,
}: UserProfileModalProps) {
  const shouldRender = useDelayUnmount(isOpen, 200);

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
    defaultValues: {
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
      toast.error("PROTOCOL OVERWRITING FAILED", {
        description: error.message,
      });
      return;
    }
    toast.success("PROTOCOL OVERWRITTEN", {
      description: "新访问密钥已建立。",
    });
    resetPassword();
  };

  const onProfileSubmit = async (data: ProfileSchema) => {
    const { error } = await authClient.updateUser({
      name: data.name,
      image: data.image,
    });
    if (error) {
      toast.error("UPDATE FAILED", {
        description: error.message || "无法更新代理人别名。",
      });
      return;
    }
    toast.success("ALIAS UPDATED", {
      description: `身份已重新注册为: ${data.name}`,
    });
  };

  if (!shouldRender || !user) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`
            relative w-full max-w-2xl bg-zzz-black border-2 border-zzz-gray shadow-[0_0_60px_rgba(0,0,0,0.8)]
            flex flex-col md:flex-row clip-corner-tr overflow-hidden
            max-h-[85vh] md:max-h-[90vh] 
            ${
              isOpen ? "animate-in zoom-in-95" : "animate-out zoom-out-95"
            } duration-200
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-50 p-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Left Column: Avatar & ID (Mobile: Top Header, Desktop: Left Sidebar) */}
        <div className="w-full md:w-64 bg-zzz-dark border-b md:border-b-0 md:border-r border-zzz-gray p-6 md:p-8 flex flex-row md:flex-col items-center md:justify-center gap-4 md:gap-0 shrink-0 relative overflow-hidden md:overflow-visible pr-12 md:pr-8">
          <div className="absolute inset-0 bg-stripe-pattern opacity-10"></div>

          {/* Avatar Ring */}
          <div className="relative md:mb-6 shrink-0">
            <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-2 border-zzz-lime p-1 relative z-10 bg-zzz-black">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zzz-gray/20 flex items-center justify-center text-zzz-lime">
                  <UserIcon size={24} className="md:w-10 md:h-10" />
                </div>
              )}
            </div>
            {/* Rotating Rings (Hidden on Mobile to save space/performance) */}
            <div className="hidden md:block absolute inset-0 -m-2 border border-zzz-gray/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="hidden md:block absolute inset-0 -m-4 border border-dashed border-zzz-gray/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          </div>

          <div className="flex flex-col items-start md:items-center min-w-0 z-10">
            <h2 className="text-lg md:text-xl font-bold font-sans text-white uppercase mb-1 truncate max-w-full">
              {user.name}
            </h2>
            <div className="text-[10px] font-mono text-zzz-lime uppercase tracking-widest px-2 py-1 bg-zzz-lime/10 border border-zzz-lime/30 rounded md:mb-6">
              {user.role === "admin" ? "ADMIN" : "PROXY"}
            </div>
          </div>

          {/* Status Stats (Desktop Only) */}
          <div className="w-full pt-6 border-t border-dashed border-zzz-gray/30 space-y-2 hidden md:block">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>STATUS</span>
              <span className="text-zzz-cyan">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>SYNC</span>
              <span className="text-white">100%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="flex-1 p-5 md:p-8 bg-black relative flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          {/* Identity Data */}
          <div className="mb-8 shrink-0">
            <h3 className="text-sm font-bold font-mono text-zzz-gray uppercase tracking-widest mb-4 flex items-center gap-2">
              <Fingerprint size={16} /> 身份数据 (Identity_Data)
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-zzz-dark border border-zzz-gray p-3 flex items-center gap-3">
                <div className="p-2 bg-black text-zzz-lime">
                  <UserIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-mono text-gray-500 uppercase">
                    Uid
                  </div>
                  <div className="text-xs font-mono text-white truncate">
                    {user.id}
                  </div>
                </div>
              </div>
              <div className="bg-zzz-dark border border-zzz-gray p-3 flex items-center gap-3">
                <div className="p-2 bg-black text-zzz-cyan">
                  <Mail size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-mono text-gray-500 uppercase">
                    通讯频道 (Email)
                  </div>
                  <div className="text-xs font-mono text-white truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Configuration */}
          <div className="mb-8 shrink-0">
            <h3 className="text-sm font-bold font-mono text-zzz-gray uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserCog size={16} /> Profile_Config
            </h3>
            <form
              onSubmit={handleSubmitProfile(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <div className="relative group">
                  <UserIcon
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      profileErrors.name
                        ? "text-zzz-orange"
                        : "text-gray-600 group-focus-within:text-zzz-lime"
                    }`}
                    size={14}
                  />
                  <input
                    type="text"
                    {...registerProfile("name")}
                    placeholder="代理人别名"
                    className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-2 focus:outline-none transition-colors ${
                      profileErrors.name
                        ? "border-zzz-orange"
                        : "border-zzz-gray focus:border-zzz-lime"
                    }`}
                  />
                </div>
                {profileErrors.name && (
                  <div className="text-[9px] text-zzz-orange font-mono uppercase pl-1">
                    {profileErrors.name.message}
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <div className="relative group">
                    <Link
                      className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        profileErrors.image
                          ? "text-zzz-orange"
                          : "text-gray-600 group-focus-within:text-zzz-lime"
                      }`}
                      size={14}
                    />
                    <input
                      type="text"
                      {...registerProfile("image")}
                      placeholder="头像 URL"
                      className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-2 focus:outline-none transition-colors ${
                        profileErrors.image
                          ? "border-zzz-orange"
                          : "border-zzz-gray focus:border-zzz-lime"
                      }`}
                    />
                  </div>
                  {profileErrors.image && (
                    <div className="text-[9px] text-zzz-orange font-mono uppercase pl-1">
                      {profileErrors.image.message}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="h-[34px] px-4 bg-zzz-dark border border-zzz-gray text-white hover:border-zzz-lime hover:text-zzz-lime transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  {isProfileSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div className="mb-8 shrink-0">
            <h3 className="text-sm font-bold font-mono text-zzz-gray uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={16} /> Security_Protocol
            </h3>

            {hasPassword ? (
              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="relative group">
                    <Lock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        passwordErrors.currentPassword
                          ? "text-zzz-orange"
                          : "text-gray-600 group-focus-within:text-zzz-lime"
                      }`}
                      size={14}
                    />
                    <input
                      type="password"
                      {...registerPassword("currentPassword")}
                      placeholder="当前访问密钥"
                      className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-2 focus:outline-none transition-colors ${
                        passwordErrors.currentPassword
                          ? "border-zzz-orange"
                          : "border-zzz-gray focus:border-zzz-lime"
                      }`}
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <div className="text-[9px] text-zzz-orange font-mono uppercase pl-1">
                      {passwordErrors.currentPassword.message}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative group">
                    <Key
                      className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        passwordErrors.newPassword
                          ? "text-zzz-orange"
                          : "text-gray-600 group-focus-within:text-zzz-lime"
                      }`}
                      size={14}
                    />
                    <input
                      type="password"
                      {...registerPassword("newPassword")}
                      placeholder="新访问密钥"
                      className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-2 focus:outline-none transition-colors ${
                        passwordErrors.newPassword
                          ? "border-zzz-orange"
                          : "border-zzz-gray focus:border-zzz-lime"
                      }`}
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <div className="text-[9px] text-zzz-orange font-mono uppercase pl-1">
                      {passwordErrors.newPassword.message}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <div className="relative group">
                      <Key
                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                          passwordErrors.confirmPassword
                            ? "text-zzz-orange"
                            : "text-gray-600 group-focus-within:text-zzz-lime"
                        }`}
                        size={14}
                      />
                      <input
                        type="password"
                        {...registerPassword("confirmPassword")}
                        placeholder="确认密钥"
                        className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-2 focus:outline-none transition-colors ${
                          passwordErrors.confirmPassword
                            ? "border-zzz-orange"
                            : "border-zzz-gray focus:border-zzz-lime"
                        }`}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <div className="text-[9px] text-zzz-orange font-mono uppercase pl-1">
                        {passwordErrors.confirmPassword.message}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isPasswordSubmitting}
                    className="h-[34px] px-4 bg-zzz-dark border border-zzz-gray text-white hover:border-zzz-lime hover:text-zzz-lime transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                  >
                    {isPasswordSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border border-zzz-gray/50 bg-zzz-dark/30 flex items-start gap-3">
                <ShieldAlert
                  className="text-zzz-gray shrink-0 mt-0.5"
                  size={16}
                />
                <div>
                  <div className="text-xs font-bold text-gray-300 uppercase mb-1">
                    检测到外部协议
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 leading-relaxed">
                    此身份由外部提供商 (如 GitHub) 管理。
                    安全设置必须通过源提供商的界面进行更新。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t border-zzz-gray flex justify-end shrink-0">
            <TechButton
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                onClose();
              }}
              className="border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-500"
              icon={<LogOut size={14} />}
            >
              终止会话
            </TechButton>
          </div>
        </div>
      </div>
    </div>
  );
}
