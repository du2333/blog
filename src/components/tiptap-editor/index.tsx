import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useState } from "react";
import InsertModal from "./ui/insert-modal";
import EditorToolbar from "./ui/editor-toolbar";
import type { Extensions, JSONContent } from "@tiptap/react";
import type { ModalType } from "./ui/insert-modal";

interface EditorProps {
  content?: JSONContent | string;
  onChange?: (json: JSONContent) => void;
  extensions: Extensions;
}

export function Editor({ content, onChange, extensions }: EditorProps) {
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [modalInitialUrl, setModalInitialUrl] = useState("");

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none focus:outline-none text-lg font-body leading-relaxed min-h-[500px]",
      },
    },
  });

  const openLinkModal = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    setModalInitialUrl(previousUrl || "");
    setModalOpen("LINK");
  }, [editor]);

  const openImageModal = useCallback(() => {
    setModalInitialUrl("");
    setModalOpen("IMAGE");
  }, []);

  const handleModalSubmit = (url: string) => {
    if (modalOpen === "LINK") {
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    } else if (modalOpen === "IMAGE") {
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }

    setModalOpen(null);
  };

  return (
    <div className="flex flex-col relative group">
      <EditorToolbar
        editor={editor}
        onLinkClick={openLinkModal}
        onImageClick={openImageModal}
      />

      <div className="relative min-h-[500px]">
        <EditorContent editor={editor} />
      </div>

      <InsertModal
        type={modalOpen}
        initialUrl={modalInitialUrl}
        onClose={() => setModalOpen(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
