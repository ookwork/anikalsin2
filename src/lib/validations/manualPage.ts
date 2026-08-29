import { z } from "zod";

export const manualPageSchema = z.object({
  isPublished: z.boolean().optional(),
  setupText: z.string().optional().or(z.literal("")),
  usageText: z.string().optional().or(z.literal("")),
  chargeText: z.string().optional().or(z.literal("")),
  careText: z.string().optional().or(z.literal("")),
  returnText: z.string().optional().or(z.literal("")),
  videoUrl: z.string().optional().or(z.literal("")),
});

export type ManualPageInput = z.infer<typeof manualPageSchema>;
