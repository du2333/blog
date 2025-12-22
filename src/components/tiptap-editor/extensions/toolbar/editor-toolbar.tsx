import { type Editor, useEditorState } from "@tiptap/react";
import clsx from "clsx";
import {
	Bold,
	Code,
	Heading2,
	Heading3,
	Image as ImageIcon,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	type LucideIcon,
	Quote,
	Redo,
	Strikethrough,
	Terminal,
	Underline as UnderlineIcon,
	Undo,
} from "lucide-react";
import type React from "react";

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
			"p-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 group relative",
			isActive
				? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
				: "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
		)}
		title={label}
		type="button"
	>
		<Icon size={16} />
	</button>
);

const EditorToolbar: React.FC<EditorToolbarProps> = ({
	editor,
	onLinkClick,
	onImageClick,
}) => {
	const {
		isBold,
		isHeading2,
		isHeading3,
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
			isHeading2: ctx.editor.isActive("heading", { level: 2 }),
			isHeading3: ctx.editor.isActive("heading", { level: 3 }),
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
		<div className="sticky top-0 z-30 mb-12 py-3 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center gap-1.5 px-2 transition-all duration-500">
			{/* Headings */}
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				isActive={isHeading2}
				icon={Heading2}
				label="大标题"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				isActive={isHeading3}
				icon={Heading3}
				label="小标题"
			/>

			<div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800 mx-2"></div>

			{/* Formatting */}
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBold().run()}
				isActive={isBold}
				icon={Bold}
				label="粗体"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleItalic().run()}
				isActive={isItalic}
				icon={Italic}
				label="斜体"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				isActive={isUnderline}
				icon={UnderlineIcon}
				label="下划线"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleStrike().run()}
				isActive={isStrike}
				icon={Strikethrough}
				label="删除线"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleCode().run()}
				isActive={isCode}
				icon={Code}
				label="行内代码"
			/>

			<div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800 mx-2"></div>

			{/* Lists & Blocks */}
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				isActive={isBulletList}
				icon={List}
				label="无序列表"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				isActive={isOrderedList}
				icon={ListOrdered}
				label="有序列表"
			/>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				isActive={isBlockquote}
				icon={Quote}
				label="引用"
			/>

			<div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800 mx-2"></div>

			{/* Inserts */}
			<ToolbarButton
				onClick={onLinkClick}
				isActive={isLink}
				icon={LinkIcon}
				label="插入链接"
			/>
			<ToolbarButton
				onClick={onImageClick}
				isActive={false}
				icon={ImageIcon}
				label="插入图片"
			/>

			<div className="ml-auto flex gap-1.5">
				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					icon={Undo}
					label="撤销"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					icon={Redo}
					label="重做"
				/>
			</div>
		</div>
	);
};

export default EditorToolbar;
