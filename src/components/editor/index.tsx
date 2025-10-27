import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { BubbleMenu } from "./bubble-menu";
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
      <BubbleMenu editor={editor} />
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
