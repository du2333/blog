import { Separator } from "@/components/ui/separator";
import { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import {
  AlignmentToolbar,
  BoldToolbar,
  ColorHighlightToolbar,
  ItalicToolbar,
  LinkToolbar,
  StrikeThroughToolbar,
  ToolbarProvider,
  UnderlineToolbar
} from "./components";

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  return (
    <TiptapBubbleMenu editor={editor}>
      <ToolbarProvider editor={editor}>
        <div className="flex items-center gap-1 px-2 bg-card border border-border rounded-md">
          <BoldToolbar />
          <ItalicToolbar />
          <UnderlineToolbar />
          <StrikeThroughToolbar />
          <LinkToolbar />
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-7 mx-1"
          />

          <AlignmentToolbar />
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-7 mx-1"
          />
          <ColorHighlightToolbar />
        </div>
      </ToolbarProvider>
    </TiptapBubbleMenu>
  );
}
