import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı giriniz."),
  slug: z.string().min(2, "Slug giriniz.").regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  shortDescription: z.string().optional().or(z.literal("")),
  description: z.string().min(10, "Açıklama giriniz."),
  price: z.coerce.number().int().min(0, "Fiyat 0 veya üzeri olmalıdır."),
  installmentInfo: z.string().optional().or(z.literal("")),
  modelId: z.string().optional().or(z.literal("")),
  colorName: z.string().optional().or(z.literal("")),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Renk kodu #rrggbb biçiminde olmalıdır.")
    .optional()
    .or(z.literal("")),
  stockCount: z.coerce.number().int().min(1, "Stok en az 1 olmalıdır."),
  featuredImageUrl: z.string().optional().or(z.literal("")),
  videoUrl: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
