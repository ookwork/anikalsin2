import { z } from "zod";

export const productModelSchema = z.object({
  name: z.string().min(2, "Model adı giriniz."),
  slug: z
    .string()
    .min(2, "Slug giriniz.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
});

export type ProductModelInput = z.infer<typeof productModelSchema>;
