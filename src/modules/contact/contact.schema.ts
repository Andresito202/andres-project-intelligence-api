import { z } from "zod";

export const createContactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  company: z.string().max(160).optional().nullable(),
  message: z.string().min(20).max(3000),
  source: z.string().min(2).max(80).default("portfolio")
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["new", "read", "archived"])
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
