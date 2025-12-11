import { load, save, type RawData } from "@orama/orama";
import { createMyDb, type MyOramaDB } from "@/lib/search/schema";

const KV_KEY = "search:index:v1";

let cachedDb: MyOramaDB | null = null;
let inflight: Promise<MyOramaDB> | null = null;

async function loadFromKv(env: Env): Promise<MyOramaDB | null> {
  if (!env.KV) return null;
  const raw = await env.KV.get<RawData>(KV_KEY, { type: "json" });
  if (!raw) return null;

  try {
    const db = await createMyDb();
    await load(db, raw);
    return db;
  } catch (error) {
    console.error("Failed to load Orama index from KV", error);
    return null;
  }
}

export async function getOramaDb(env: Env): Promise<MyOramaDB> {
  if (cachedDb) return cachedDb;
  if (inflight) return inflight;

  inflight = (async () => {
    const fromKv = await loadFromKv(env);
    if (fromKv) return fromKv;
    return await createMyDb();
  })().finally(() => {
    inflight = null;
  });

  cachedDb = await inflight;
  return cachedDb;
}

export async function persistOramaDb(env: Env, db: MyOramaDB) {
  if (!env.KV) return;
  const raw = save(db);
  await env.KV.put(KV_KEY, JSON.stringify(raw));
}

export function setOramaDb(db: MyOramaDB) {
  cachedDb = db;
}
