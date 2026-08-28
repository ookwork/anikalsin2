import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

/** Ödeme penceresi dolmuş, hâlâ PENDING olan rezervasyonları ve ödemelerini EXPIRED yapar. */
export async function expireStalePendingReservations(client: DbClient = prisma) {
  const now = new Date();

  const stale = await client.payment.findMany({
    where: { status: "PENDING", expiresAt: { lt: now } },
    select: { id: true, reservationId: true },
  });
  if (stale.length === 0) return 0;

  const reservationIds = stale.map((p) => p.reservationId);
  const paymentIds = stale.map((p) => p.id);

  const reservations = await client.reservation.findMany({
    where: { id: { in: reservationIds }, status: { in: ["PENDING", "CONFIRMED"] } },
    select: { id: true, eventDate: true, rentalStart: true },
  });

  // Süresi dolan rezervasyon daha önce onaylanmış olsa bile, artık ±4 günlük tampon bloklamasın diye
  // takvim penceresi tekrar tek güne daraltılır.
  await Promise.all(
    reservations.map((r) => {
      const base = startOfDay(r.eventDate ?? r.rentalStart);
      return client.reservation.update({
        where: { id: r.id },
        data: { status: "EXPIRED", rentalStart: base, rentalEnd: addDays(base, 1) },
      });
    })
  );

  await client.payment.updateMany({
    where: { id: { in: paymentIds }, status: "PENDING" },
    data: { status: "EXPIRED" },
  });

  return stale.length;
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferenceCode(length = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
}

export async function generateUniqueReferenceCode(client: DbClient = prisma) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferenceCode();
    const existing = await client.payment.findUnique({ where: { referenceCode: code } });
    if (!existing) return code;
  }
  throw new Error("Referans kodu üretilemedi.");
}

export async function getPaymentWindowHours() {
  const row = await prisma.siteContent.findUnique({ where: { key: "payment.windowHours" } });
  const n = Number(row?.value ?? 2);
  return Number.isFinite(n) && n > 0 ? n : 2;
}
