import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationStatusUpdateSchema } from "@/lib/validations/reservation";
import { getReservedQuantity } from "@/lib/availability";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const TERMINAL_STATUSES = new Set(["REJECTED", "CANCELLED", "EXPIRED"]);

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reservationStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { product: true, payment: true },
  });
  if (!reservation) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı." }, { status: 404 });
  }

  if (parsed.data.status === "CONFIRMED") {
    const reserved = await getReservedQuantity(
      reservation.productId,
      reservation.rentalStart,
      reservation.rentalEnd,
      reservation.id
    );
    if (reservation.product.stockCount - reserved < reservation.quantity) {
      return NextResponse.json(
        { error: "Bu tarihte yeterli stok yok, önce çakışan rezervasyonu düzenleyin." },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.reservation.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.adminNote !== undefined && { adminNote: parsed.data.adminNote }),
      },
    });

    if (TERMINAL_STATUSES.has(parsed.data.status) && reservation.payment?.status === "PENDING") {
      await tx.payment.update({
        where: { id: reservation.payment.id },
        data: { status: "FAILED" },
      });
    }

    return result;
  });

  return NextResponse.json({ reservation: updated });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
