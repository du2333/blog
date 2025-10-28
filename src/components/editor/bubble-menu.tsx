import { Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  const { isBold, isItalic, isUnderline } = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
    }),
  });
  return (
    <TiptapBubbleMenu editor={editor}>
      <div className="flex gap-2">
        <BubbleItem
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={isBold}
        >
          Bold
        </BubbleItem>
        <BubbleItem
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={isItalic}
        >
          Italic
        </BubbleItem>
        <BubbleItem
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={isUnderline}
        >
          Underline
        </BubbleItem>
      </div>
    </TiptapBubbleMenu>
  );
}

function BubbleItem({
  children,
  onClick,
  isActive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(isActive && "text-white bg-blue-500")}
    >
      {children}
    </Button>
  );
}
