import { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import {
  BoldToolbar,
  ItalicToolbar,
  LinkToolbar,
  StrikeThroughToolbar,
  ToolbarProvider,
  UnderlineToolbar,
} from "./components";

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  return (
    <TiptapBubbleMenu
      editor={editor}
      className="flex items-center gap-1 p-1.5 bg-zzz-black border border-zzz-lime shadow-[0_0_20px_rgba(204,255,0,0.2)] rounded-sm overflow-hidden"
    >
      <ToolbarProvider editor={editor}>
        <div className="flex items-center gap-1 px-2 py-1.5 bg-zzz-black border border-zzz-gray rounded-none clip-corner-tr shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <BoldToolbar />
          <ItalicToolbar />
          <UnderlineToolbar />
          <StrikeThroughToolbar />
          <div className="w-px h-4 bg-zzz-gray mx-1"></div>
          <LinkToolbar />
        </div>
      </ToolbarProvider>
    </TiptapBubbleMenu>
  );
}
