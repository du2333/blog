import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const TooltipContext = React.createContext<{
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
} | null>(null);

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ isVisible, setIsVisible }}>
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement & {
      props: { className?: string };
    };
    return React.cloneElement(child, {
      ...props,
      className: cn(className, child.props.className),
      ref,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }
>(({ className, sideOffset = 4, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipContent must be used within Tooltip");

  if (!context.isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 overflow-hidden border border-border/30 bg-popover px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-popover-foreground whitespace-nowrap",
        // Simple positioning (bottom center by default for this custom impl)
        "top-full left-1/2 -translate-x-1/2 mt-2",
        className,
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
