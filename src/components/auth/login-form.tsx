import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/auth.client";
import TechButton from "@/components/ui/tech-button";
import {
  Mail,
  Lock,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("INVALID_CHANNEL_FORMAT"),
  password: z.string().min(1, "ACCESS_KEY_REQUIRED"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [loginStep, setLoginStep] = useState<
    "IDLE" | "VERIFYING" | "SYNCING" | "SUCCESS"
  >("IDLE");
  const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: standardSchemaResolver(loginSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: LoginSchema) => {
    setLoginStep("VERIFYING");
    setIsUnverifiedEmail(false);

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setLoginStep("IDLE");
      if (error.status === 403) {
        setError("root", {
          message: "ACCESS_DENIED: Unverified Email",
        });
        setIsUnverifiedEmail(true);
      } else {
        setError("root", {
          message: "ACCESS_DENIED: Invalid Credentials",
        });
      }
      toast.error("ACCESS_DENIED", {
        description: error.message,
      });
      return;
    }

    setLoginStep("SYNCING");
    setTimeout(() => {
      setLoginStep("SUCCESS");
      setTimeout(() => {
        navigate({ to: "/admin" });
      }, 800);
    }, 800);
  };

  const handleResendVerification = async () => {
    if (!emailValue) return;
    toast.promise(
      authClient.sendVerificationEmail({
        email: emailValue,
        callbackURL: `${window.location.origin}/verify-email`,
      }),
      {
        loading: "TRANSMITTING SIGNAL...",
        success: "VERIFICATION LINK RESENT",
        error: "TRANSMISSION FAILED",
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="bg-zzz-orange/10 border border-zzz-orange p-3 flex flex-col items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle size={16} className="text-zzz-orange shrink-0" />
            <div className="text-xs font-mono text-zzz-orange font-bold uppercase">
              {errors.root.message}
            </div>
          </div>
          {/* Specific UI for unverified email based on typical auth flows */}
          {isUnverifiedEmail && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-[10px] font-mono text-white underline hover:text-zzz-lime ml-7"
            >
              [RESEND_VERIFICATION_SIGNAL]
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-1 group">
          <label
            className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              errors.email
                ? "text-zzz-orange"
                : "text-gray-500 group-focus-within:text-zzz-lime"
            }`}
          >
            Proxy Email
          </label>
          <div className="relative">
            <Mail
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.email
                  ? "text-zzz-orange"
                  : "text-gray-600 group-focus-within:text-zzz-lime"
              }`}
              size={18}
            />
            <input
              type="email"
              {...register("email")}
              className={`w-full bg-black border text-white font-mono text-sm py-3 pl-10 pr-4 focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800 ${
                errors.email
                  ? "border-zzz-orange focus:border-zzz-orange"
                  : "border-zzz-gray focus:border-zzz-lime"
              }`}
              placeholder="name@example.com"
              autoComplete="username"
              disabled={isSubmitting || loginStep !== "IDLE"}
            />
          </div>
          {errors.email && (
            <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1 pt-1">
              {errors.email.message}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1 group">
          <div className="flex justify-between items-center">
            <label
              className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                errors.password
                  ? "text-zzz-orange"
                  : "text-gray-500 group-focus-within:text-zzz-cyan"
              }`}
            >
              Access Key
            </label>
            <Link
              to="/forgot-password"
              tabIndex={-1}
              className="text-[9px] font-mono font-bold text-gray-600 hover:text-zzz-cyan uppercase tracking-wider transition-colors"
            >
              Lost Key?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.password
                  ? "text-zzz-orange"
                  : "text-gray-600 group-focus-within:text-zzz-cyan"
              }`}
              size={18}
            />
            <input
              type="password"
              {...register("password")}
              className={`w-full bg-black border text-white font-mono text-sm py-3 pl-10 pr-4 focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800 ${
                errors.password
                  ? "border-zzz-orange focus:border-zzz-orange"
                  : "border-zzz-gray focus:border-zzz-cyan"
              }`}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting || loginStep !== "IDLE"}
            />
          </div>
          {errors.password && (
            <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1 pt-1">
              {errors.password.message}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <TechButton
        type="submit"
        disabled={isSubmitting || loginStep !== "IDLE"}
        className={`w-full h-12 text-sm justify-center ${
          loginStep === "SUCCESS"
            ? "bg-zzz-lime! text-black! border-zzz-lime!"
            : ""
        }`}
        icon={
          loginStep === "VERIFYING" ? (
            <Loader2 className="animate-spin" size={18} />
          ) : loginStep === "SYNCING" ? (
            <Zap className="animate-pulse" size={18} />
          ) : loginStep === "SUCCESS" ? (
            <ShieldCheck size={18} />
          ) : (
            <ChevronRight size={18} />
          )
        }
      >
        {loginStep === "IDLE" && "ESTABLISH CONNECTION"}
        {loginStep === "VERIFYING" && "VERIFYING CREDENTIALS..."}
        {loginStep === "SYNCING" && "SYNCING NEURAL CLOUD..."}
        {loginStep === "SUCCESS" && "ACCESS GRANTED"}
      </TechButton>
    </form>
  );
}
