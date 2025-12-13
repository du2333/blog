import TechButton from "@/components/ui/tech-button";
import { authClient } from "@/lib/auth/auth.client";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Mail, Radio } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("INVALID_CHANNEL_FORMAT"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-link`,
    });

    if (error) {
      toast.error("TRANSMISSION FAILED", {
        description: "Could not send recovery signal.",
      });
      return;
    }

    setSentEmail(data.email);
    setIsSent(true);
    toast.success("RECOVERY BEACON ACTIVE", {
      description: "Check your comms channel for the reset key.",
    });
  };

  if (isSent) {
    return (
      <div className="text-center py-4 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-zzz-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-zzz-lime animate-pulse">
          <Radio size={32} className="text-zzz-lime" />
        </div>
        <h3 className="text-xl font-bold font-sans uppercase text-white mb-2">
          Signal Sent
        </h3>
        <p className="text-xs font-mono text-gray-400 mb-8 leading-relaxed">
          We have transmitted a recovery key to{" "}
          <span className="text-zzz-cyan">{sentEmail}</span>. Please use the
          link to restore your HDD access.
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 bg-zzz-orange/5 border border-zzz-orange/30 text-zzz-orange text-[10px] font-mono leading-relaxed">
        NOTICE: Lost keys cannot be recovered from the Hollow. A reset link will
        be sent to your registered channel.
      </div>

      <div className="space-y-1 group">
        <label
          className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            errors.email
              ? "text-zzz-orange"
              : "text-gray-500 group-focus-within:text-zzz-lime"
          }`}
        >
          Registered Email
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
          />
        </div>
        {errors.email && (
          <div className="text-[10px] text-zzz-orange font-mono uppercase pl-1">
            {errors.email.message}
          </div>
        )}
      </div>

      <TechButton
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-sm justify-center"
        icon={
          isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Radio size={18} />
          )
        }
      >
        {isSubmitting ? "TRANSMITTING..." : "SEND RECOVERY SIGNAL"}
      </TechButton>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="text-[10px] font-mono font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors group"
        >
          <ArrowRight
            size={12}
            className="rotate-180 group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Login
        </button>
      </div>
    </form>
  );
}
