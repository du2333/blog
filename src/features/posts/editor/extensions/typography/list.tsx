import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import { mergeAttributes } from "@tiptap/react";

// 1. 无序列表 (ul) - 恢复标准列表样式
export const BulletListExtension = BulletList.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "ul",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        // pl-5 恢复缩进, list-disc 显示圆点
        class: "my-4 pl-5 list-disc",
      }),
      0,
    ];
  },
});

// 2. 有序列表 (ol) - 恢复标准列表样式
export const OrderedListExtension = OrderedList.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "ol",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        // pl-5 恢复缩进, list-decimal 显示数字
        class: "my-4 pl-5 list-decimal",
      }),
      0,
    ];
  },
});

// 3. 列表项 (li) - 最简结构，让浏览器处理默认行为
export const ListItemExtension = ListItem.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "li",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "my-1",
      }),
      0,
    ];
  },
});
