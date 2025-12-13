import { DB } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";

export async function userHasPassword(db: DB, userId: string) {
  const user = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), isNotNull(account.password)),
  });

  return !!user;
}
