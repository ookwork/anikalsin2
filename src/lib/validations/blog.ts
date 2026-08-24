import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(2, "Başlık giriniz."),
  slug: z.string().min(2, "Slug giriniz.").regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  excerpt: z.string().optional().or(z.literal("")),
  content: z.string().min(10, "İçerik giriniz."),
  coverImage: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
