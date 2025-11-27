import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Editor } from "@tiptap/react";
import {
  UnderlineToolbar,
  BoldToolbar,
  BulletListToolbar,
  ItalicToolbar,
  LinkToolbar,
  OrderedListToolbar,
  StrikeThroughToolbar,
  ToolbarProvider,
} from "./components"; 

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
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-7 mx-1"
                />

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
