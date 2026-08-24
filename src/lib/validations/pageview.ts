import { z } from "zod";

export const pageViewCreateSchema = z.object({
  path: z.string().min(1).max(500),
  visitorId: z.string().min(1).max(100),
});

export const pageViewDurationSchema = z.object({
  id: z.string().min(1),
  durationMs: z.coerce.number().int().min(0).max(1000 * 60 * 60 * 6),
});
