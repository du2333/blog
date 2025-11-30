import React from "react";
import { Editor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Undo,
  Redo,
  Terminal,
  Link as LinkIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  LucideIcon,
} from "lucide-react";
import clsx from "clsx";

interface EditorToolbarProps {
  editor: Editor;
  onLinkClick: () => void;
  onImageClick: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  label?: string;
  variant?: "default" | "ghost";
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  icon: Icon,
  label,
  variant = "default",
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "p-1.5 rounded-sm border transition-all duration-200 flex items-center justify-center gap-2 group relative",
      isActive
        ? "bg-zzz-lime text-black border-zzz-lime shadow-[0_0_10px_#ccff00]"
        : variant === "ghost"
        ? "bg-transparent text-white hover:bg-zzz-gray"
        : "bg-black text-gray-400 border-gray-800 hover:border-zzz-lime hover:text-zzz-lime"
    )}
    title={label}
    type="button"
  >
    <Icon size={variant === "ghost" ? 14 : 16} />
  </button>
);

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onLinkClick,
  onImageClick,
}) => {
  const {
    isBold,
    isHeading1,
    isHeading2,
    isItalic,
    isUnderline,
    isStrike,
    isCode,
    isBulletList,
    isOrderedList,
    isBlockquote,
    isLink,
  } = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isHeading1: ctx.editor.isActive("heading", { level: 1 }),
      isHeading2: ctx.editor.isActive("heading", { level: 2 }),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
      isStrike: ctx.editor.isActive("strike"),
      isCode: ctx.editor.isActive("code"),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      isBlockquote: ctx.editor.isActive("blockquote"),
      isLink: ctx.editor.isActive("link"),
    }),
  });
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-30 mb-8 py-2 bg-black/80 backdrop-blur-sm border-b border-zzz-gray/50 flex flex-wrap items-center gap-1 transition-opacity opacity-50 hover:opacity-100 focus-within:opacity-100">
      <div className="mr-2 px-2 py-1 bg-zzz-gray/10 rounded text-[10px] font-mono font-bold text-zzz-lime flex items-center gap-1">
        <Terminal size={10} />
      </div>

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={isHeading1}
        icon={Heading1}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={isHeading2}
        icon={Heading2}
      />

      <div className="h-4 w-px bg-zzz-gray mx-1"></div>

      {/* Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={isBold}
        icon={Bold}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={isItalic}
        icon={Italic}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={isUnderline}
        icon={UnderlineIcon}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={isStrike}
        icon={Strikethrough}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={isCode}
        icon={Code}
      />

      <div className="h-4 w-px bg-zzz-gray mx-1"></div>

      {/* Lists & Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={isBulletList}
        icon={List}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={isOrderedList}
        icon={ListOrdered}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={isBlockquote}
        icon={Quote}
      />

      <div className="h-4 w-px bg-zzz-gray mx-1"></div>

      {/* Inserts */}
      <ToolbarButton onClick={onLinkClick} isActive={isLink} icon={LinkIcon} />
      <ToolbarButton onClick={onImageClick} isActive={false} icon={ImageIcon} />

      <div className="ml-auto flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
        />
      </div>
    </div>
  );
};

export default EditorToolbar;
