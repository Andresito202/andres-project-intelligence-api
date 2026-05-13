import { asc } from "drizzle-orm";

import { skills } from "../../db/schema";
import type { Database } from "../../db/client";

export async function listSkills(db: Database) {
  return db.select().from(skills).orderBy(asc(skills.category), asc(skills.displayOrder), asc(skills.name));
}
