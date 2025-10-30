import { BoldIcon } from "lucide-react";
import React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";
import { useEditorState } from "@tiptap/react";

const BoldToolbar = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isBold } = useEditorState({
        editor,
        selector: (ctx) => ({
            isBold: ctx.editor.isActive("bold"),
        }),
    });
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={cn(
            "h-8 w-8 p-0 sm:h-9 sm:w-9",
            isBold && "bg-accent",
            className
          )}
          onClick={(e) => {
            editor.chain().focus().toggleBold().run();
            onClick?.(e);
          }}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          ref={ref}
          {...props}
        >
          {children ?? <BoldIcon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Bold</span>
      </TooltipContent>
    </Tooltip>
  );
});

BoldToolbar.displayName = "BoldToolbar";

export { BoldToolbar };
