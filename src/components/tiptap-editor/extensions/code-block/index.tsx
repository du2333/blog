import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";
import { CodeBlockView } from "./code-block-view";

export const CodeBlockExtension = CodeBlockShiki.extend({
	addNodeView() {
		return ReactNodeViewRenderer(CodeBlockView);
	},
});
