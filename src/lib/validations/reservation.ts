import { z } from "zod";

export const reservationSchema = z.object({
  productId: z.string().min(1, "Ürün seçimi zorunludur."),
  customerName: z.string().min(2, "Ad soyad giriniz."),
  customerPhone: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
  customerEmail: z.string().email("Geçerli bir e-posta giriniz.").optional().or(z.literal("")),
  eventCity: z.string().min(2, "Etkinlik şehri giriniz.").optional().or(z.literal("")),
  deliveryAddress: z.string().optional().or(z.literal("")),
  eventDate: z.coerce.date(),
  note: z.string().optional().or(z.literal("")),
  frameId: z.string().optional().or(z.literal("")),
  addOnIds: z.array(z.string()).optional().default([]),
  discountCode: z.string().optional().or(z.literal("")),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const couponValidateSchema = z.object({
  code: z.string().min(1, "Kupon kodu giriniz."),
  subtotal: z.coerce.number().int().min(0),
});

export const reservationStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "EXPIRED"]),
  adminNote: z.string().optional(),
});

export const shippingUpdateSchema = z.object({
  shippingCarrier: z.string().optional().or(z.literal("")),
  shippingTrackingNumber: z.string().optional().or(z.literal("")),
  shippingDate: z.coerce.date().optional().or(z.literal("")),
});
