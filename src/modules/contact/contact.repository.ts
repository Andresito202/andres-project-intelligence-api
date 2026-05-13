import { desc, eq } from "drizzle-orm";

import { contactMessages } from "../../db/schema";
import type { Database } from "../../db/client";
import type { CreateContactMessageInput, UpdateContactStatusInput } from "./contact.schema";

export async function createContactMessage(db: Database, input: CreateContactMessageInput) {
  return db
    .insert(contactMessages)
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      message: input.message,
      source: input.source
    })
    .returning()
    .get();
}

export async function listContactMessages(db: Database) {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100);
}

export async function updateContactMessageStatus(db: Database, id: string, input: UpdateContactStatusInput) {
  return db
    .update(contactMessages)
    .set({
      status: input.status,
      updatedAt: new Date().toISOString()
    })
    .where(eq(contactMessages.id, id))
    .returning()
    .get();
}
