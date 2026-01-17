import { Check, Info, Loader2, X } from "lucide-react";
import { Toaster as Sonner } from "sonner";
import type React from "react";
import type { ToasterProps } from "sonner";

const Toaster: React.FC<ToasterProps> = (props) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      visibleToasts={3}
      duration={4000}
      icons={{
        success: (
          <Check size={14} strokeWidth={1.5} className="text-foreground" />
        ),
        error: <X size={14} strokeWidth={1.5} className="text-destructive" />,
        info: (
          <Info size={14} strokeWidth={1.5} className="text-muted-foreground" />
        ),
        warning: (
          <Info size={14} strokeWidth={1.5} className="text-amber-500" />
        ),
        loading: (
          <Loader2
            size={14}
            strokeWidth={1.5}
            className="text-muted-foreground animate-spin"
          />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group w-full max-w-72 flex items-start justify-start text-left gap-3 p-4 bg-background border border-border/30 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:translate-y-2 data-[state=open]:translate-y-0",
          title:
            "font-serif text-sm font-medium tracking-tight text-foreground",
          description:
            "text-[9px] text-muted-foreground/60 leading-relaxed font-mono uppercase tracking-widest mt-1",
          content:
            "flex flex-col gap-1 flex-1 min-w-0 items-start text-left order-2",
          icon: "shrink-0 mt-0.5 flex items-start justify-start order-1",
          loader: "shrink-0 mt-0.5 flex items-start justify-start order-1",
          actionButton:
            "bg-foreground text-background font-mono px-3 py-1.5 text-[9px] uppercase tracking-widest hover:opacity-80 transition-opacity",
          cancelButton:
            "border border-border/40 text-muted-foreground px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest hover:border-foreground transition-all",
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
