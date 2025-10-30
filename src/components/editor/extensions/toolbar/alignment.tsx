import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
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

const LeftAlignToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isLeftAlign, isImage, isVideo } = useEditorState({
      editor,
      selector: (ctx) => ({
        isLeftAlign: ctx.editor.isActive({ textAlign: "left" }),
        isImage: ctx.editor.isActive("image"),
        isVideo: ctx.editor.isActive("video"),
      }),
    });

    const isDisabled = isImage ?? isVideo ?? false;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              "h-8 w-8 p-0 sm:h-9 sm:w-9",
              isLeftAlign && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor?.chain().focus().setTextAlign("left").run();
              onClick?.(e);
            }}
            disabled={
              isDisabled ||
              !editor?.can().chain().focus().setTextAlign("left").run()
            }
            ref={ref}
            {...props}
          >
            {children ?? <AlignLeft className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Left Align</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

LeftAlignToolbar.displayName = "LeftAlignToolbar";

const CenterAlignToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isCenterAlign, isImage, isVideo } = useEditorState({
      editor,
      selector: (ctx) => ({
        isCenterAlign: ctx.editor.isActive({ textAlign: "center" }),
        isImage: ctx.editor.isActive("image"),
        isVideo: ctx.editor.isActive("video"),
      }),
    });

    const isDisabled = isImage ?? isVideo ?? false;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              "h-8 w-8 p-0 sm:h-9 sm:w-9",
              isCenterAlign && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor?.chain().focus().setTextAlign("center").run();
              onClick?.(e);
            }}
            disabled={
              isDisabled ||
              !editor?.can().chain().focus().setTextAlign("center").run()
            }
            ref={ref}
            {...props}
          >
            {children ?? <AlignCenter className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Center Align</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

CenterAlignToolbar.displayName = "CenterAlignToolbar";

const RightAlignToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isRightAlign, isImage, isVideo } = useEditorState({
      editor,
      selector: (ctx) => ({
        isRightAlign: ctx.editor.isActive({ textAlign: "right" }),
        isImage: ctx.editor.isActive("image"),
        isVideo: ctx.editor.isActive("video"),
      }),
    });

    const isDisabled = isImage ?? isVideo ?? false;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              "h-8 w-8 p-0 sm:h-9 sm:w-9",
              isRightAlign && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor?.chain().focus().setTextAlign("right").run();
              onClick?.(e);
            }}
            disabled={
              isDisabled ||
              !editor?.can().chain().focus().setTextAlign("right").run()
            }
            ref={ref}
            {...props}
          >
            {children ?? <AlignRight className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Right Align</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

RightAlignToolbar.displayName = "RightAlignToolbar";

const JustifyAlignToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    const { isJustifyAlign, isImage, isVideo } = useEditorState({
      editor,
      selector: (ctx) => ({
        isJustifyAlign: ctx.editor.isActive({ textAlign: "justify" }),
        isImage: ctx.editor.isActive("image"),
        isVideo: ctx.editor.isActive("video"),
      }),
    });

    const isDisabled = isImage ?? isVideo ?? false;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              "h-8 w-8 p-0 sm:h-9 sm:w-9",
              isJustifyAlign && "bg-accent",
              className
            )}
            onClick={(e) => {
              editor?.chain().focus().setTextAlign("justify").run();
              onClick?.(e);
            }}
            disabled={
              isDisabled ||
              !editor?.can().chain().focus().setTextAlign("justify").run()
            }
            ref={ref}
            {...props}
          >
            {children ?? <AlignJustify className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Justify Align</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

JustifyAlignToolbar.displayName = "JustifyAlignToolbar";

export const AlignmentToolbar = () => {
  return (
    <>
      <LeftAlignToolbar />
      <CenterAlignToolbar />
      <RightAlignToolbar />
      <JustifyAlignToolbar />
    </>
  );
};
