import { z } from "zod";

export const frameSchema = z.object({
  name: z.string().min(2, "İsim giriniz."),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().int().min(0, "Fiyat 0 veya üzeri olmalıdır."),
  isPremium: z.boolean().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export type FrameInput = z.infer<typeof frameSchema>;
