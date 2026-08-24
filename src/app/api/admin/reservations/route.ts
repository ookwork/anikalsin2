import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@/generated/prisma/client";
import { expireStalePendingReservations } from "@/lib/payments";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = new Set(Object.values(ReservationStatus));

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const productId = searchParams.get("productId");
  const validStatus =
    status && VALID_STATUSES.has(status as ReservationStatus) ? (status as ReservationStatus) : undefined;

  await expireStalePendingReservations();

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(productId ? { productId } : {}),
    },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations });
}
