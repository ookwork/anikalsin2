import { NextRequest, NextResponse } from "next/server";
import { addDays, startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { reservationStatusUpdateSchema } from "@/lib/validations/reservation";
import { getReservedQuantity } from "@/lib/availability";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const TERMINAL_STATUSES = new Set(["REJECTED", "CANCELLED", "EXPIRED"]);
const CONFIRMED_BUFFER_DAYS = 4;

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

  const base = startOfDay(reservation.eventDate ?? reservation.rentalStart);
  const isConfirming = parsed.data.status === "CONFIRMED";
  const newRentalStart = isConfirming ? subDays(base, CONFIRMED_BUFFER_DAYS) : base;
  const newRentalEnd = isConfirming ? addDays(base, CONFIRMED_BUFFER_DAYS + 1) : addDays(base, 1);

  if (isConfirming) {
    const reserved = await getReservedQuantity(reservation.productId, newRentalStart, newRentalEnd, reservation.id);
    if (reservation.product.stockCount - reserved < reservation.quantity) {
      return NextResponse.json(
        {
          error:
            "Bu tarih aralığında (etkinlik tarihi ±4 gün) çakışan başka bir rezervasyon var, önce onu düzenleyin.",
        },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.reservation.update({
      where: { id },
      data: {
        status: parsed.data.status,
        rentalStart: newRentalStart,
        rentalEnd: newRentalEnd,
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
