import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import { mergeAttributes } from "@tiptap/react";

// 1. 无序列表 (ul)
export const BulletListExtension = BulletList.extend({
	renderHTML({ HTMLAttributes }) {
		return [
			"ul",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: "my-8 pl-6 md:pl-10 list-none space-y-4",
			}),
			0,
		];
	},
});

// 2. 有序列表 (ol)
export const OrderedListExtension = OrderedList.extend({
	renderHTML({ HTMLAttributes }) {
		return [
			"ol",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class:
					"my-8 pl-6 md:pl-10 list-none is-ol [counter-reset:minimal-counter] space-y-4",
			}),
			0,
		];
	},
});

// 3. 列表项 (li)
export const ListItemExtension = ListItem.extend({
	renderHTML({ HTMLAttributes }) {
		return [
			"li",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class:
					"relative flex gap-4 group items-start [counter-increment:minimal-counter] text-lg leading-relaxed",
			}),
			// --- 标记图标区域 ---
			[
				"div",
				{
					class:
						"shrink-0 select-none flex items-center h-[1.625em] font-mono text-sm opacity-40 group-hover:opacity-100 transition-opacity",
				},

				// A. 点号 (仅在无序列表显示)
				[
					"div",
					{
						class: `
              w-1.5 h-1.5 rounded-full bg-muted-foreground 
              group-hover:bg-foreground transition-all duration-300
              [.is-ol_&]:hidden
            `,
					},
				],

				// B. 数字序号 (仅在有序列表显示)
				[
					"span",
					{
						class: `
              hidden [.is-ol_&]:inline-block
              before:content-[counter(minimal-counter,decimal-leading-zero)]
            `,
					},
				],
			],

			// --- 内容区域 ---
			["div", { class: "min-w-0 flex-1" }, 0],
		];
	},
});
