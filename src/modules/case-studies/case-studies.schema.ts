import { z } from "zod";

export const caseStudyListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(30).default(10)
});

export const createCaseStudySchema = z.object({
  projectId: z.string().min(1),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  problem: z.string().min(20).max(4000),
  solution: z.string().min(20).max(4000),
  architecture: z.string().min(20).max(4000),
  results: z.string().min(20).max(4000),
  lessons: z.string().min(20).max(4000)
});

export type CaseStudyListQuery = z.infer<typeof caseStudyListQuerySchema>;
