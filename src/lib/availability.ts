import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

export async function getReservedQuantity(
  productId: string,
  start: Date,
  end: Date,
  excludeReservationId?: string,
  client: DbClient = prisma
) {
  const overlapping = await client.reservation.findMany({
    where: {
      productId,
      status: { in: [...BLOCKING_STATUSES] },
      rentalStart: { lt: end },
      rentalEnd: { gt: start },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: { quantity: true },
  });
  return overlapping.reduce((sum, r) => sum + r.quantity, 0);
}

export async function checkAvailability(
  productId: string,
  start: Date,
  end: Date,
  requestedQty = 1,
  client: DbClient = prisma
) {
  const product = await client.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { available: false, remaining: 0, product: null };
  }
  const reserved = await getReservedQuantity(productId, start, end, undefined, client);
  const remaining = product.stockCount - reserved;
  return { available: remaining >= requestedQty, remaining, product };
}

/** İlgili ürüne uygulanan (ürüne özel veya tüm ürünler için geçerli) admin tarafından kapatılmış günleri döndürür. */
async function getBlockedDateRows(productId: string) {
  return prisma.blockedDate.findMany({
    where: { OR: [{ productId }, { productId: null }] },
    select: { date: true },
  });
}

/** Bir ay içindeki her gün için o günün dolu olup olmadığını döndürür (takvimde işaretlemek için). */
export async function getBookedDateRanges(productId: string) {
  const reservations = await prisma.reservation.findMany({
    where: {
      productId,
      status: { in: [...BLOCKING_STATUSES] },
    },
    select: { rentalStart: true, rentalEnd: true, quantity: true },
  });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return [];

  const blockedRows = await getBlockedDateRows(productId);
  const blockedRanges = blockedRows.map((b) => ({
    from: b.date,
    to: new Date(b.date.getTime() + 24 * 60 * 60 * 1000),
  }));

  // Basit yaklaşım: toplam stok tek adetse (en yaygın durum) her rezervasyon aralığı dolu kabul edilir.
  // Stok birden fazlaysa, günlük toplam talep stok sayısına ulaştığında o gün dolu sayılır.
  if (product.stockCount <= 1) {
    return [...reservations.map((r) => ({ from: r.rentalStart, to: r.rentalEnd })), ...blockedRanges];
  }

  return [...computeFullyBookedRanges(reservations, product.stockCount), ...blockedRanges];
}

/** Bir tarih, admin tarafından ürüne özel veya tüm ürünler için kapatılmış mı? (Gün bazlı, saat bilgisi yok sayılır.) */
export async function isDateBlocked(productId: string, date: Date, client: DbClient = prisma) {
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const match = await client.blockedDate.findFirst({
    where: {
      OR: [{ productId }, { productId: null }],
      date: { gte: dayStart, lt: dayEnd },
    },
  });
  return !!match;
}

function computeFullyBookedRanges(
  reservations: { rentalStart: Date; rentalEnd: Date; quantity: number }[],
  stockCount: number
) {
  if (reservations.length === 0) return [];

  const points = new Set<number>();
  for (const r of reservations) {
    points.add(r.rentalStart.getTime());
    points.add(r.rentalEnd.getTime());
  }
  const sorted = Array.from(points).sort((a, b) => a - b);

  const fullyBooked: { from: Date; to: Date }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i];
    const segEnd = sorted[i + 1];
    const overlapping = reservations.filter(
      (r) => r.rentalStart.getTime() < segEnd && r.rentalEnd.getTime() > segStart
    );
    const demand = overlapping.reduce((sum, r) => sum + r.quantity, 0);
    if (demand >= stockCount) {
      fullyBooked.push({ from: new Date(segStart), to: new Date(segEnd) });
    }
  }
  return fullyBooked;
}
