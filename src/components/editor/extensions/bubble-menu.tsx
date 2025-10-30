import { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { BoldToolbar } from "./toolbar/bold";
import { ToolbarProvider } from "./toolbar/toolbar-provider";

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  return (
    <TiptapBubbleMenu editor={editor}>
      <ToolbarProvider editor={editor}>
      <div className="flex items-center gap-1 px-2">
        <BoldToolbar />
      </div>
      </ToolbarProvider>
    </TiptapBubbleMenu>
  );
}

