import { z } from "zod";

export const voiceDeliverySchema = z.object({
  driveUrl: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  resetPassword: z.boolean().optional(),
});

export const voiceUnlockSchema = z.object({
  password: z.string().min(1, "Şifre giriniz."),
});
