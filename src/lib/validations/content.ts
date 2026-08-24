import { z } from "zod";

export const contentUpdateSchema = z.object({
  entries: z.record(z.string(), z.string()),
});

export const testimonialSchema = z.object({
  authorName: z.string().min(2, "İsim giriniz."),
  authorLocation: z.string().optional().or(z.literal("")),
  content: z.string().min(5, "Yorum metni giriniz."),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  avatarUrl: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export const faqSchema = z.object({
  question: z.string().min(3, "Soru giriniz."),
  answer: z.string().min(3, "Cevap giriniz."),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export const addOnSchema = z.object({
  name: z.string().min(2, "İsim giriniz."),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().int().min(0, "Fiyat 0 veya üzeri olmalıdır."),
  category: z.enum(["ACCESSORY", "STAFF_SERVICE"]),
  cityRestriction: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});
