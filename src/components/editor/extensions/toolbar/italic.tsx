import { ItalicIcon } from "lucide-react";
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

const ItalicToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isItalic } = useEditorState({
        editor,
        selector: (ctx) => ({
            isItalic: ctx.editor.isActive("italic"),
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
              isItalic && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor.chain().focus().toggleItalic().run();
              onClick?.(e);
            }}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            ref={ref}
            {...props}
          >
            {children ?? <ItalicIcon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Italic</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

ItalicToolbar.displayName = "ItalicToolbar";

export { ItalicToolbar };
