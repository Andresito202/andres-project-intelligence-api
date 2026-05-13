import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  level: z.number().int().min(1).max(5),
  icon: z.string().max(80).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0)
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
