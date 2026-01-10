import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, checked, onCheckedChange, onChange, ...props }, ref) => (
  <div className="relative flex items-center">
    <input
      type="checkbox"
      className="peer absolute h-4 w-4 opacity-0 cursor-pointer z-10"
      ref={ref}
      checked={checked}
      onChange={(e) => {
        onChange?.(e);
        onCheckedChange?.(e.target.checked);
      }}
      {...props}
    />
    <div
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        checked ? "bg-primary text-primary-foreground" : "bg-transparent",
        className,
      )}
    >
      {checked && <Check className="h-3 w-3" />}
    </div>
  </div>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
