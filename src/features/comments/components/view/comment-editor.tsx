import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { commentExtensions } from "../editor/config";
import CommentEditorToolbar from "../editor/comment-editor-toolbar";
import InsertModal from "../editor/comment-insert-modal";
import type { JSONContent } from "@tiptap/react";
import type { ModalType } from "../editor/comment-insert-modal";
import { Button } from "@/components/ui/button";
import { normalizeLinkHref } from "@/lib/links/normalize-link-href";

interface CommentEditorProps {
  onSubmit: (content: JSONContent) => Promise<void>;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export const CommentEditor = ({
  onSubmit,
  isSubmitting,
  autoFocus,
  onCancel,
  submitLabel = "发表评论",
}: CommentEditorProps) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalInitialUrl, setModalInitialUrl] = useState("");

  const editor = useEditor({
    extensions: commentExtensions,
    content: "",
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] max-h-[400px] w-full bg-transparent p-4 text-sm focus:outline-none overflow-y-auto prose prose-sm prose-zinc prose-invert max-w-none",
      },
    },
  });

  const openLinkModal = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    setModalInitialUrl(previousUrl || "");
    setModalType("LINK");
  }, [editor]);

  const openImageModal = useCallback(() => {
    setModalInitialUrl("");
    setModalType("IMAGE");
  }, []);

  const handleSubmit = async () => {
    if (editor.isEmpty || isSubmitting) return;

    try {
      await onSubmit(editor.getJSON());
      editor.commands.clearContent();
    } catch (error) {
      // Error handled by parent hook
    }
  };

  return (
    <div className="relative border border-border/50 bg-accent/20 rounded-sm transition-all duration-300 focus-within:border-primary/50 focus-within:bg-accent/30">
      <CommentEditorToolbar
        editor={editor}
        onLinkClick={openLinkModal}
        onImageClick={openImageModal}
      />

      <EditorContent editor={editor} />

      <div className="flex items-center justify-end gap-3 p-3 border-t border-border/30 bg-background/30">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            取消
          </Button>
        )}
        <Button
          size="sm"
          disabled={editor.isEmpty || isSubmitting}
          onClick={handleSubmit}
          className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/10 transition-all duration-300 active:scale-95"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin mr-2" />
          ) : (
            <Send size={14} className="mr-2" />
          )}
          {submitLabel}
        </Button>
      </div>

      <InsertModal
        type={modalType}
        initialUrl={modalInitialUrl}
        onClose={() => setModalType(null)}
        onSubmit={(url) => {
          if (modalType === "LINK") {
            const href = normalizeLinkHref(url);
            if (href === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
            } else {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href })
                .run();
            }
          } else if (modalType === "IMAGE") {
            editor.chain().focus().setImage({ src: url }).run();
          }
          setModalType(null);
        }}
      />
    </div>
  );
};
