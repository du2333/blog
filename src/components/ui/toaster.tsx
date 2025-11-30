import React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";

const Toaster: React.FC<ToasterProps> = (props) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      visibleToasts={5}
      duration={4000}
      icons={{
        success: <CheckCircle2 size={18} className="text-black" />,
        error: <XCircle size={18} className="text-black" />,
        info: <Info size={18} className="text-black" />,
        warning: <AlertCircle size={18} className="text-black" />,
        loading: <Loader2 size={18} className="text-zzz-lime animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group w-full flex items-start gap-4 p-4 font-mono text-sm border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-right-full data-[state=open]:sm:slide-in-from-bottom-full clip-corner-tr backdrop-blur-md",
          title: "font-bold uppercase tracking-wider text-xs md:text-sm",
          description:
            "text-[10px] md:text-xs text-gray-400 mt-1 leading-relaxed",
          actionButton:
            "bg-zzz-lime text-black font-bold px-3 py-1 text-xs uppercase hover:bg-white transition-colors",
          cancelButton:
            "bg-zzz-dark text-gray-400 border border-zzz-gray px-3 py-1 text-xs uppercase hover:text-white transition-colors",

          // Type Specific Styles
          default: "bg-zzz-black/95 border-zzz-gray text-white",
          success:
            "bg-zzz-black/95 border-zzz-lime text-white [&_[data-icon]]:bg-zzz-lime [&_[data-icon]]:rounded-full [&_[data-icon]]:p-0.5",
          error:
            "bg-zzz-black/95 border-zzz-orange text-white [&_[data-icon]]:bg-zzz-orange [&_[data-icon]]:rounded-full [&_[data-icon]]:p-0.5",
          warning:
            "bg-zzz-black/95 border-yellow-500 text-white [&_[data-icon]]:bg-yellow-500 [&_[data-icon]]:rounded-full [&_[data-icon]]:p-0.5",
          info: "bg-zzz-black/95 border-zzz-cyan text-white [&_[data-icon]]:bg-zzz-cyan [&_[data-icon]]:rounded-full [&_[data-icon]]:p-0.5",
          loader: "bg-zzz-black/95 border-zzz-gray text-zzz-lime",
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
