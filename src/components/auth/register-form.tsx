import TechButton from "@/components/ui/tech-button";
import { authClient } from "@/lib/auth/auth.client";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouteContext } from "@tanstack/react-router";

const registerSchema = z
  .object({
    name: z.string().min(2, "ALIAS_TOO_SHORT (MIN 2)"),
    email: z.email("INVALID_CHANNEL_FORMAT"),
    password: z.string().min(8, "KEY_TOO_WEAK (MIN 8 CHARS)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "KEYS_DO_NOT_MATCH",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { isEmailVerficationRequired } = useRouteContext({ from: "/_auth" });
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: standardSchemaResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      callbackURL: `${window.location.origin}/verify-email`,
    });

    if (error) {
      toast.error("REGISTRATION FAILED", {
        description: error.message || "Signal blocked by firewall.",
      });
      return;
    }

    if (isEmailVerficationRequired) {
      setIsSuccess(true);
      toast.success("PROXY ID CREATED", {
        description: "Verification signal sent. Check your inbox.",
      });
    } else {
      toast.success("ACCESS GRANTED", {
        description: "Welcome to the Inter-Knot.",
      });
      navigate({ to: "/admin" });
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-zzz-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-zzz-lime animate-pulse">
          <Sparkles size={32} className="text-zzz-lime" />
        </div>
        <h3 className="text-xl font-bold font-sans uppercase text-white mb-2">
          Verify Signal
        </h3>
        <p className="text-xs font-mono text-gray-400 mb-8 leading-relaxed px-4">
          A neural link verification has been transmitted to your email channel.
          <br />
          <br />
          Please confirm the link to activate your HDD system access.
        </p>
        <TechButton
          onClick={() => navigate({ to: "/login" })}
          className="w-full justify-center"
        >
          RETURN TO LOGIN
        </TechButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-1 group">
        <label
          className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            errors.name
              ? "text-zzz-orange"
              : "text-gray-500 group-focus-within:text-zzz-lime"
          }`}
        >
          Proxy Name
        </label>
        <div className="relative">
          <User
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              errors.name
                ? "text-zzz-orange"
                : "text-gray-600 group-focus-within:text-zzz-lime"
            }`}
            size={16}
          />
          <input
            type="text"
            {...register("name")}
            className={`w-full bg-black border text-white font-mono text-xs py-3 pl-10 pr-4 focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800 ${
              errors.name
                ? "border-zzz-orange focus:border-zzz-orange"
                : "border-zzz-gray focus:border-zzz-lime"
            }`}
            placeholder="ENTER_ALIAS"
          />
        </div>
        {errors.name && (
          <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
            {errors.name.message}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1 group">
        <label
          className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            errors.email
              ? "text-zzz-orange"
              : "text-gray-500 group-focus-within:text-zzz-cyan"
          }`}
        >
          Comms Channel (Email)
        </label>
        <div className="relative">
          <Mail
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              errors.email
                ? "text-zzz-orange"
                : "text-gray-600 group-focus-within:text-zzz-cyan"
            }`}
            size={16}
          />
          <input
            type="email"
            {...register("email")}
            className={`w-full bg-black border text-white font-mono text-xs py-3 pl-10 pr-4 focus:outline-none focus:bg-zzz-dark transition-all placeholder-gray-800 ${
              errors.email
                ? "border-zzz-orange focus:border-zzz-orange"
                : "border-zzz-gray focus:border-zzz-cyan"
            }`}
            placeholder="name@example.com"
          />
        </div>
        {errors.email && (
          <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1 group">
          <label
            className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              errors.password
                ? "text-zzz-orange"
                : "text-gray-500 group-focus-within:text-white"
            }`}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.password
                  ? "text-zzz-orange"
                  : "text-gray-600 group-focus-within:text-white"
              }`}
              size={16}
            />
            <input
              type="password"
              {...register("password")}
              className={`w-full bg-black border text-white font-mono text-xs py-3 pl-10 pr-2 focus:outline-none transition-all placeholder-gray-800 ${
                errors.password
                  ? "border-zzz-orange focus:border-zzz-orange"
                  : "border-zzz-gray focus:border-white"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
              {errors.password.message}
            </div>
          )}
        </div>
        <div className="space-y-1 group">
          <label
            className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              errors.confirmPassword
                ? "text-zzz-orange"
                : "text-gray-500 group-focus-within:text-white"
            }`}
          >
            Confirm
          </label>
          <div className="relative">
            <Shield
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                errors.confirmPassword
                  ? "text-zzz-orange"
                  : "text-gray-600 group-focus-within:text-white"
              }`}
              size={16}
            />
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full bg-black border text-white font-mono text-xs py-3 pl-10 pr-2 focus:outline-none transition-all placeholder-gray-800 ${
                errors.confirmPassword
                  ? "border-zzz-orange focus:border-zzz-orange"
                  : "border-zzz-gray focus:border-white"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>
      </div>

      <TechButton
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-sm justify-center mt-4"
        icon={
          isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <ChevronRight size={18} />
          )
        }
      >
        {isSubmitting ? "REGISTERING..." : "INITIATE REGISTRATION"}
      </TechButton>
    </form>
  );
}
