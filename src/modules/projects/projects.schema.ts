import { z } from "zod";

export const repoVisibilitySchema = z.enum(["public", "private", "unpublished"]);
export const projectStatusSchema = z.enum([
  "production",
  "published",
  "prototype",
  "in_development",
  "archived"
]);

export const projectListQuerySchema = z.object({
  featured: z.coerce.boolean().optional(),
  status: projectStatusSchema.optional(),
  category: z.string().min(1).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const createProjectSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(500),
  longDescription: z.string().min(20).max(4000),
  problemSolved: z.string().max(4000).optional().nullable(),
  role: z.string().min(2).max(120),
  type: z.string().min(2).max(160),
  status: projectStatusSchema,
  featured: z.boolean().default(false),
  year: z.number().int().min(2020).max(2100),
  demoUrl: z.string().url().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  repoVisibility: repoVisibilitySchema.default("unpublished"),
  category: z.string().min(2).max(80),
  stack: z.array(z.string().min(1).max(80)).default([]),
  features: z.array(z.string().min(1).max(220)).default([]),
  screenshots: z.array(z.string().min(1).max(300)).default([])
});

export const updateProjectSchema = createProjectSchema.partial();

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
