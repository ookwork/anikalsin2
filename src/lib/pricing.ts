import type { DiscountType } from "@/generated/prisma/client";

/** Verilen ara toplam üzerinden indirim tutarını hesaplar; ara toplamı aşamaz veya negatif olamaz. Client ve server'da ortak kullanılır. */
export function computeDiscountAmount(subtotal: number, discount: { type: DiscountType; value: number }) {
  const raw = discount.type === "PERCENTAGE" ? Math.round((subtotal * discount.value) / 100) : discount.value;
  return Math.min(Math.max(raw, 0), subtotal);
}
