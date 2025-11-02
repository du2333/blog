import { Transaction } from "@tiptap/pm/state";
import { extractImageKey } from "@/lib/files";
import { deleteImageFn } from "@/core/functions/images";

export function handleImageDeletes(transaction: Transaction) {
  // 如果事务没有改变文档，直接返回
  if (!transaction.docChanged) {
    return;
  }

  // 递归获取文档中所有图片的 key（包括嵌套的）
  const getImageKeys = (doc: typeof transaction.doc) => {
    const keys = new Set<string>();
    doc.descendants((node) => {
      if (node.type.name === "image") {
        const key = extractImageKey(node.attrs.src);
        if (key) {
          keys.add(key);
        }
      }
    });
    return keys;
  };

  const currentKeys = getImageKeys(transaction.doc);
  const previousKeys = getImageKeys(transaction.before);

  // 找出真正被删除的图片 key（在新文档中不存在）
  const deletedKeys = [...previousKeys].filter((key) => !currentKeys.has(key));

  if (deletedKeys.length > 0) {
    deletedKeys.forEach((key) => {
      deleteImageFn({ data: { key } })
        .then(() => {
          console.log(`[Deleted] Image: ${key}`);
        })
        .catch((error) => {
          console.error(`[Error] Failed to delete image: ${key}`, error);
        });
    });
  }
}
