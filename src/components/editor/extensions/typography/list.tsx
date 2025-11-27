import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";
import { mergeAttributes } from "@tiptap/react";

// 1. 无序列表 (ul)
export const BulletListExtension = BulletList.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "ul",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "my-6 pl-4 md:pl-8 list-none",
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
        // is-ol: 标记自己是有序列表，供子元素识别
        // [counter-reset:zzz-counter]: 初始化计数器
        class: "my-6 pl-4 md:pl-8 list-none is-ol [counter-reset:zzz-counter]",
      }),
      0,
    ];
  },
});

// 3. 列表项 (li) - 智能兼容两种样式
export const ListItemExtension = ListItem.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "li",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        // [counter-increment:zzz-counter]: 计数器 +1
        class:
          "flex gap-4 mb-4 text-gray-300 group items-start [counter-increment:zzz-counter] text-base md:text-lg leading-relaxed",
      }),
      // --- 标记图标区域 ---
      [
        "div",
        {
          // 高度设为 1.625em (leading-relaxed) 以确保与第一行文字垂直居中对齐
          class: "shrink-0 select-none flex items-center h-[1.625em]",
          contenteditable: "false",
        },

        // A. 钻石图标 (仅在无序列表显示)
        // 逻辑: 默认显示，如果父级有 .is-ol 则隐藏
        [
          "div",
          {
            class: `
              w-2 h-2 bg-zzz-gray border border-zzz-lime rotate-45 
              group-hover:bg-zzz-lime transition-all duration-300
              [.is-ol_&]:hidden
            `,
          },
        ],

        // B. 数字序号 (仅在有序列表显示)
        // 逻辑: 默认隐藏，如果父级有 .is-ol 则显示
        // 使用 CSS counter 生成 01, 02...
        [
          "span",
          {
            class: `
              hidden [.is-ol_&]:inline-block
              font-mono text-zzz-black bg-zzz-lime px-1.5 py-0.5 text-xs font-bold rounded-sm
              before:content-[counter(zzz-counter,decimal-leading-zero)]
            `,
          },
        ],
      ],

      // --- 内容区域 ---
      [
        "div",
        { class: "min-w-0" },
        0, // 子内容插槽
      ],
    ];
  },
});
