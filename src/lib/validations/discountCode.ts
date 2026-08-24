import { z } from "zod";

export const discountCodeSchema = z
  .object({
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.coerce.number().int().min(1, "Değer 1 veya üzeri olmalıdır."),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.value <= 100, {
    message: "Yüzde değeri 100'ü geçemez.",
    path: ["value"],
  });

export type DiscountCodeInput = z.infer<typeof discountCodeSchema>;
