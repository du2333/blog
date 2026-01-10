import * as React from "react";
import { cn } from "@/lib/utils";

const HoverCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("relative group/hovercard inline-block", className)}>
    {children}
  </div>
);

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => (
  <div ref={ref} className={cn("cursor-pointer", className)} {...props}>
    {children}
  </div>
));
HoverCardTrigger.displayName = "HoverCardTrigger";

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "center", children, ...props }, ref) => {
  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-64 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
        "invisible opacity-0 group-hover/hovercard:visible group-hover/hovercard:opacity-100 transition-all duration-300",
        "top-full mt-2",
        alignClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
