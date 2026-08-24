import { z } from "zod";

export const audioSampleSchema = z.object({
  title: z.string().min(2, "Başlık giriniz."),
  description: z.string().optional().or(z.literal("")),
  audioUrl: z.string().min(1, "Ses dosyası yükleyiniz."),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export type AudioSampleInput = z.infer<typeof audioSampleSchema>;
