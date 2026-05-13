import { and, asc, desc, eq } from "drizzle-orm";

import { encodeJson } from "../../lib/json";
import { projects, type NewProjectRow } from "../../db/schema";
import type { Database } from "../../db/client";
import type { CreateProjectInput, ProjectListQuery, UpdateProjectInput } from "./projects.schema";

function toProjectRow(input: CreateProjectInput): NewProjectRow {
  return {
    id: crypto.randomUUID(),
    slug: input.slug,
    title: input.title,
    description: input.description,
    longDescription: input.longDescription,
    problemSolved: input.problemSolved ?? null,
    role: input.role,
    type: input.type,
    status: input.status,
    featured: input.featured,
    year: input.year,
    demoUrl: input.demoUrl ?? null,
    repoUrl: input.repoUrl ?? null,
    repoVisibility: input.repoVisibility,
    category: input.category,
    stack: encodeJson(input.stack),
    features: encodeJson(input.features),
    screenshots: encodeJson(input.screenshots)
  };
}

function toProjectUpdate(input: UpdateProjectInput): Partial<NewProjectRow> {
  const update: Partial<NewProjectRow> = {};

  if (input.slug !== undefined) update.slug = input.slug;
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.longDescription !== undefined) update.longDescription = input.longDescription;
  if (input.problemSolved !== undefined) update.problemSolved = input.problemSolved;
  if (input.role !== undefined) update.role = input.role;
  if (input.type !== undefined) update.type = input.type;
  if (input.status !== undefined) update.status = input.status;
  if (input.featured !== undefined) update.featured = input.featured;
  if (input.year !== undefined) update.year = input.year;
  if (input.demoUrl !== undefined) update.demoUrl = input.demoUrl;
  if (input.repoUrl !== undefined) update.repoUrl = input.repoUrl;
  if (input.repoVisibility !== undefined) update.repoVisibility = input.repoVisibility;
  if (input.category !== undefined) update.category = input.category;
  if (input.stack !== undefined) update.stack = encodeJson(input.stack);
  if (input.features !== undefined) update.features = encodeJson(input.features);
  if (input.screenshots !== undefined) update.screenshots = encodeJson(input.screenshots);

  update.updatedAt = new Date().toISOString();
  return update;
}

export async function listProjects(db: Database, query: ProjectListQuery) {
  const conditions = [];

  if (query.featured !== undefined) conditions.push(eq(projects.featured, query.featured));
  if (query.status) conditions.push(eq(projects.status, query.status));
  if (query.category) conditions.push(eq(projects.category, query.category));

  if (conditions.length > 0) {
    return db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.featured), desc(projects.year), asc(projects.title))
      .limit(query.limit);
  }

  return db
    .select()
    .from(projects)
    .orderBy(desc(projects.featured), desc(projects.year), asc(projects.title))
    .limit(query.limit);
}

export async function getProjectBySlug(db: Database, slug: string) {
  return db.select().from(projects).where(eq(projects.slug, slug)).get();
}

export async function createProject(db: Database, input: CreateProjectInput) {
  return db.insert(projects).values(toProjectRow(input)).returning().get();
}

export async function updateProject(db: Database, id: string, input: UpdateProjectInput) {
  return db.update(projects).set(toProjectUpdate(input)).where(eq(projects.id, id)).returning().get();
}

export async function deleteProject(db: Database, id: string) {
  return db.delete(projects).where(eq(projects.id, id)).returning().get();
}
