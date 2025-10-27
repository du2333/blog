import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";

interface EditorProps {
  content?: JSONContent | string;
  onSave?: (json: JSONContent) => void;
}

export function Editor({ content, onSave }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
  });

  if (!editor) return null;

  const handleSave = () => {
    if (!editor || !onSave) return;

    const json = editor.getJSON();

    onSave(json);
  };

  return (
    <>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
      {onSave && (
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      )}
    </>
  );
}
