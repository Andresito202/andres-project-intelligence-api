import { asc, eq } from "drizzle-orm";

import { repoStatus } from "../../db/schema";
import type { Database } from "../../db/client";

export async function listRepoStatus(db: Database) {
  return db.select().from(repoStatus).orderBy(asc(repoStatus.projectSlug));
}

export async function getRepoStatusByProjectSlug(db: Database, projectSlug: string) {
  return db.select().from(repoStatus).where(eq(repoStatus.projectSlug, projectSlug)).get();
}
