import { PopoverClose } from "@radix-ui/react-popover";
import { Trash2, X, LinkIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

import React, { type FormEvent } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getUrlFromString } from "@/lib/editor-utils";
import { useEditorState } from "@tiptap/react";
import { useToolbar } from "./toolbar-provider";

const LinkToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { editor } = useToolbar();
    const [link, setLink] = React.useState("");
    const { isLink } = useEditorState({
      editor,
      selector: (ctx) => ({
        isLink: ctx.editor.isActive("link"),
      }),
    });

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      const url = getUrlFromString(link);
      url && editor?.chain().focus().setLink({ href: url }).run();
    };

    React.useEffect(() => {
      setLink(editor?.getAttributes("link").href ?? "");
    }, [editor]);

    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger
              disabled={!editor?.can().chain().setLink({ href: "" }).run()}
              asChild
            >
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className={cn(
                  "h-8 w-max px-3 font-normal rounded-none hover:bg-zzz-gray hover:text-zzz-lime transition-colors",
                  isLink && "bg-zzz-lime text-black hover:bg-zzz-lime hover:text-black",
                  className
                )}
                ref={ref}
                {...props}
              >
                <LinkIcon className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <span>Link</span>
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          asChild
          className="relative px-3 py-2.5 bg-zzz-black border-zzz-gray border rounded-none clip-corner-bl shadow-xl"
        >
          <div className="relative">
            <PopoverClose className="absolute right-3 top-3 text-gray-400 hover:text-zzz-lime transition-colors">
              <X className="h-4 w-4" />
            </PopoverClose>
            <form onSubmit={handleSubmit}>
              <Label className="text-white font-mono uppercase">Link</Label>
              <p className="text-sm text-gray-400 font-mono">
                Add a link to the selected text
              </p>
              <div className="mt-3 flex flex-col items-end justify-end gap-3">
                <Input
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value);
                  }}
                  className="w-full bg-zzz-dark border-zzz-gray text-white focus-visible:ring-zzz-lime font-mono rounded-none"
                  placeholder="https://example.com"
                />
                <div className="flex items-center gap-3">
                  {editor?.getAttributes("link").href && (
                    <Button
                      type="reset"
                      size="sm"
                      className="h-8 text-gray-400 cursor-pointer hover:text-zzz-orange hover:bg-zzz-gray/50 rounded-none"
                      variant="ghost"
                      onClick={() => {
                        editor?.chain().focus().unsetLink().run();
                        setLink("");
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                  <Button size="sm" className="h-8 cursor-pointer bg-zzz-lime text-black hover:bg-white hover:text-black rounded-none font-bold font-mono clip-corner-tr">
                    {editor?.getAttributes("link").href ? "Update" : "Confirm"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

LinkToolbar.displayName = "LinkToolbar";

export { LinkToolbar };
