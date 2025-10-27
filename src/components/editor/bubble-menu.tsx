import { Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  const { isBold, isItalic } = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
    }),
  });
  return (
    <TiptapBubbleMenu editor={editor}>
      <div>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          {isBold ? "Bold" : "Bold"}
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          {isItalic ? "Italic" : "Italic"}
        </button>
      </div>
    </TiptapBubbleMenu>
  );
}
