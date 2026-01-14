import { and, eq } from "drizzle-orm";
import type { EmailUnsubscribeType } from "@/lib/db/schema";
import { EmailUnsubscriptionsTable } from "@/lib/db/schema";

export async function isUnsubscribed(
  db: DB,
  userId: string,
  type: EmailUnsubscribeType,
): Promise<boolean> {
  const result = await db.query.EmailUnsubscriptionsTable.findFirst({
    where: and(
      eq(EmailUnsubscriptionsTable.userId, userId),
      eq(EmailUnsubscriptionsTable.type, type),
    ),
  });
  return !!result;
}

export async function subscribe(
  db: DB,
  userId: string,
  type: EmailUnsubscribeType,
): Promise<void> {
  await db
    .delete(EmailUnsubscriptionsTable)
    .where(
      and(
        eq(EmailUnsubscriptionsTable.userId, userId),
        eq(EmailUnsubscriptionsTable.type, type),
      ),
    );
}

export async function unsubscribe(
  db: DB,
  userId: string,
  type: EmailUnsubscribeType,
): Promise<void> {
  await db
    .insert(EmailUnsubscriptionsTable)
    .values({
      userId,
      type,
    })
    .onConflictDoNothing(); // Already unsubscribed
}
