import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Editor } from "@tiptap/react";
import { AlignmentToolbar } from "./alignment";
import { BoldToolbar } from "./bold";
import { BulletListToolbar } from "./bullet-list";
import { HorizontalRuleToolbar } from "./horizontal-rule";
import { ItalicToolbar } from "./italic";
import { LinkToolbar } from "./link";
import { OrderedListToolbar } from "./ordered-list";
import { StrikeThroughToolbar } from "./strikethrough";
import { ToolbarProvider } from "./toolbar-provider";
import { UnderlineToolbar } from "./underline";

export const EditorToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="sticky top-0 z-20 w-full border-b bg-background hidden sm:block">
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className="h-fit py-0.5">
            <div>
              <div className="flex items-center gap-1 px-2">
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                <StrikeThroughToolbar />
                <LinkToolbar />
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-7 mx-1"
                />

                <BulletListToolbar />
                <OrderedListToolbar />
                <HorizontalRuleToolbar />
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-7 mx-1"
                />

                <AlignmentToolbar />
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-7 mx-1"
                />
              </div>
            </div>
            <ScrollBar className="hidden" orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  );
};
