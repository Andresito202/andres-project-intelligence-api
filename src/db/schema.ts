import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),
    problemSolved: text("problem_solved"),
    role: text("role").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    year: integer("year").notNull(),
    demoUrl: text("demo_url"),
    repoUrl: text("repo_url"),
    repoVisibility: text("repo_visibility", {
      enum: ["public", "private", "unpublished"]
    })
      .notNull()
      .default("unpublished"),
    category: text("category").notNull(),
    stack: text("stack").notNull().default("[]"),
    features: text("features").notNull().default("[]"),
    screenshots: text("screenshots").notNull().default("[]"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    slugIdx: uniqueIndex("projects_slug_idx").on(table.slug),
    categoryIdx: index("projects_category_idx").on(table.category),
    statusIdx: index("projects_status_idx").on(table.status),
    featuredIdx: index("projects_featured_idx").on(table.featured)
  })
);

export const skills = sqliteTable(
  "skills",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    level: integer("level").notNull(),
    icon: text("icon"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    nameIdx: uniqueIndex("skills_name_idx").on(table.name),
    categoryIdx: index("skills_category_idx").on(table.category)
  })
);

export const caseStudies = sqliteTable(
  "case_studies",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    problem: text("problem").notNull(),
    solution: text("solution").notNull(),
    architecture: text("architecture").notNull(),
    results: text("results").notNull(),
    lessons: text("lessons").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    slugIdx: uniqueIndex("case_studies_slug_idx").on(table.slug),
    projectIdIdx: index("case_studies_project_id_idx").on(table.projectId)
  })
);

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  source: text("source").notNull().default("portfolio"),
  status: text("status", { enum: ["new", "read", "archived"] }).notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  statusIdx: index("contact_messages_status_idx").on(table.status),
  createdAtIdx: index("contact_messages_created_at_idx").on(table.createdAt)
}));

export const repoStatus = sqliteTable(
  "repo_status",
  {
    id: text("id").primaryKey(),
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    repoUrl: text("repo_url"),
    visibility: text("visibility", { enum: ["public", "private", "unpublished"] })
      .notNull()
      .default("unpublished"),
    isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(false),
    lastCheckedAt: text("last_checked_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    projectSlugIdx: uniqueIndex("repo_status_project_slug_idx").on(table.projectSlug)
  })
);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type SkillRow = typeof skills.$inferSelect;
export type CaseStudyRow = typeof caseStudies.$inferSelect;
export type ContactMessageRow = typeof contactMessages.$inferSelect;
export type RepoStatusRow = typeof repoStatus.$inferSelect;
