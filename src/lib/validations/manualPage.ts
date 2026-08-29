import { z } from "zod";

export const manualPageSchema = z.object({
  isPublished: z.boolean().optional(),
  coverImage: z.string().optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
});

export type ManualPageInput = z.infer<typeof manualPageSchema>;
