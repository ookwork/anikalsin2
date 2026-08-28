import { z } from "zod";

export const blockedDateSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    productId: z.string().optional().or(z.literal("")),
    reason: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
    path: ["endDate"],
  });

export type BlockedDateInput = z.infer<typeof blockedDateSchema>;
