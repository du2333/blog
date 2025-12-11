import { slugify } from "@/lib/editor-utils";

const DEFAULT_COUNT = 100;
const DEFAULT_PUBLISHED_RATIO = 1.0; // 0~1
const BATCH_SIZE = 25; // split into multiple statements to avoid oversized SQL
const TABLE = "posts"; // change if your table name differs
const COLS = [
  "title",
  "slug",
  "summary",
  "category",
  "status",
  "content_json",
  "read_time_in_minutes",
  "published_at",
  "created_at",
  "updated_at",
];

type Options = {
  count?: number;
  publishedRatio?: number;
};

function toUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

const dictionary = [
  "人工智能",
  "深度学习",
  "React",
  "Drizzle",
  "Cloudflare",
  "Workers",
  "Orama",
  "搜索引擎",
  "优化",
  "架构设计",
  "高性能",
  "Serverless",
  "Web开发",
  "前端",
  "后端",
  "全栈",
  "数据库",
  "索引",
  "节点",
  "Lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
];

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sentence(words: number) {
  const parts = Array.from({ length: words }, () => pick(dictionary));
  const s = parts.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function summary() {
  const sentences = Array.from(
    { length: 2 + Math.floor(Math.random() * 2) },
    () => sentence(6 + Math.floor(Math.random() * 4))
  );
  return sentences.join(". ") + ".";
}

function buildTiptapDoc() {
  const paragraphCount = 5 + Math.floor(Math.random() * 4); // 5~8 段
  const paragraphs = Array.from({ length: paragraphCount }, () =>
    sentence(35 + Math.floor(Math.random() * 25))
  );
  const doc = {
    type: "doc",
    content: paragraphs.map((p) => ({
      type: "paragraph",
      content: [{ type: "text", text: p }],
    })),
  };
  const plain = paragraphs.join(" ");
  return { doc, plain };
}

function esc(str: string) {
  return str.replace(/'/g, "''");
}

export function generateSeedSql(options: Options = {}) {
  const count = options.count ?? DEFAULT_COUNT;
  const publishedRatio = options.publishedRatio ?? DEFAULT_PUBLISHED_RATIO;
  const now = toUnixSeconds(new Date());

  const values: string[] = [];

  for (let i = 1; i <= count; i++) {
    const title = sentence(4 + Math.floor(Math.random() * 4));
    const slug = `${slugify(title)}-${Date.now()}-${i}`;
    const summaryText = summary();
    const { doc, plain: bodyPlain } = buildTiptapDoc();
    const read = Math.max(
      1,
      Math.ceil(bodyPlain.split(/\s+/).filter(Boolean).length / 200)
    );
    const status = Math.random() < publishedRatio ? "published" : "draft";
    const publishedAtSeconds =
      status === "published"
        ? toUnixSeconds(new Date(Date.now() - Math.random() * 1e10))
        : null;
    const category = pick(["DEV", "LIFE", "GAMING", "TECH"] as const);
    const contentJson = JSON.stringify(doc);

    values.push(
      `('${esc(title)}','${esc(slug)}','${esc(
        summaryText
      )}','${category}','${status}',` +
        `'${esc(contentJson)}',${read},` +
        (publishedAtSeconds !== null ? `${publishedAtSeconds}` : "NULL") +
        `,${now},${now})`
    );
  }

  const inserts: string[] = [];
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const chunk = values.slice(i, i + BATCH_SIZE);
    const stmt = `INSERT INTO ${TABLE} (${COLS.join(",")}) VALUES\n${chunk.join(
      ",\n"
    )};`;
    inserts.push(stmt);
  }

  return inserts.join("\n\n");
}

export function main(argv = process.argv) {
  const countArg = Number(argv[2]);
  const ratioArg = Number(argv[3]);
  const sql = generateSeedSql({
    count: Number.isFinite(countArg) ? countArg : undefined,
    publishedRatio: Number.isFinite(ratioArg) ? ratioArg : undefined,
  });
  // eslint-disable-next-line no-console
  console.log(sql);
}

// If run directly (CJS or ESM), invoke main
const isDirect =
  (typeof module !== "undefined" && module?.filename === __filename) ||
  (typeof import.meta !== "undefined" &&
    typeof process !== "undefined" &&
    import.meta.url === `file://${process.argv[1]}`);

if (isDirect) {
  main();
}
