import { decodeJsonArray } from "../../lib/json";
import type { ProjectRow } from "../../db/schema";

export function mapProject(row: ProjectRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.longDescription,
    problemSolved: row.problemSolved,
    role: row.role,
    type: row.type,
    status: row.status,
    featured: row.featured,
    year: row.year,
    demoUrl: row.demoUrl,
    repoUrl: row.repoUrl,
    repoVisibility: row.repoVisibility,
    category: row.category,
    stack: decodeJsonArray(row.stack),
    features: decodeJsonArray(row.features),
    screenshots: decodeJsonArray(row.screenshots),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
