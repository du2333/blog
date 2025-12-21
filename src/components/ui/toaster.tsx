import React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { AlertCircle, Check, Info, Loader2, X } from "lucide-react";

const Toaster: React.FC<ToasterProps> = (props) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      visibleToasts={3}
      duration={4000}
      icons={{
        success: (
          <Check size={16} className="text-zinc-900 dark:text-zinc-100" />
        ),
        error: <X size={16} className="text-red-500" />,
        info: <Info size={16} className="text-zinc-500" />,
        warning: <AlertCircle size={16} className="text-amber-500" />,
        loading: <Loader2 size={16} className="text-zinc-400 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group w-full max-w-[320px] flex items-start justify-start text-left gap-4 p-5 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl border border-zinc-100 dark:border-zinc-900 shadow-2xl transition-all duration-500 rounded-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:translate-y-2 data-[state=open]:translate-y-0 data-[state=closed]:scale-95 data-[state=open]:scale-100",
          title:
            "font-serif text-sm font-medium tracking-tight text-zinc-950 dark:text-zinc-50",
          description:
            "text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-sans uppercase tracking-[0.2em] mt-1",
          content:
            "flex flex-col gap-1 flex-1 min-w-0 items-start text-left order-2",
          icon: "shrink-0 mt-0.5 flex items-start justify-start order-1",
          loader: "shrink-0 mt-0.5 flex items-start justify-start order-1",
          actionButton:
            "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-sans px-4 py-1.5 text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity",
          cancelButton:
            "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-4 py-1.5 text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity",
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
