import { asc, eq } from "drizzle-orm";

import { caseStudies } from "../../db/schema";
import type { Database } from "../../db/client";
import type { CaseStudyListQuery } from "./case-studies.schema";

export async function listCaseStudies(db: Database, query: CaseStudyListQuery) {
  return db.select().from(caseStudies).orderBy(asc(caseStudies.slug)).limit(query.limit);
}

export async function getCaseStudyBySlug(db: Database, slug: string) {
  return db.select().from(caseStudies).where(eq(caseStudies.slug, slug)).get();
}
