import { Strikethrough } from "lucide-react";
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

const StrikeThroughToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isStrike } = useEditorState({
      editor,
      selector: (ctx) => ({
        isStrike: ctx.editor.isActive("strike"),
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
              isStrike && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor.chain().focus().toggleStrike().run();
              onClick?.(e);
            }}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            ref={ref}
            {...props}
          >
            {children ?? <Strikethrough className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Strikethrough</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

StrikeThroughToolbar.displayName = "StrikeThroughToolbar";

export { StrikeThroughToolbar };
