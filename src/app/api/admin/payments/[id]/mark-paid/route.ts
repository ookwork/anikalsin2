import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { expireStalePendingReservations } from "@/lib/payments";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const markPaidSchema = z.object({
  method: z.enum(["EFT_HAVALE", "CREDIT_CARD_DEMO"]).default("EFT_HAVALE"),
  adminNote: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = markPaidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  await expireStalePendingReservations();

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  const updatedCount = await prisma.$transaction(async (tx) => {
    const result = await tx.payment.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "PAID",
        method: parsed.data.method,
        paidAt: new Date(),
        paidVia: "ADMIN_MANUAL",
        ...(parsed.data.adminNote !== undefined && { adminNote: parsed.data.adminNote }),
      },
    });
    if (result.count > 0) {
      await tx.reservation.updateMany({
        where: { id: payment.reservationId, status: "PENDING" },
        data: { status: "CONFIRMED" },
      });
    }
    return result.count;
  });

  if (updatedCount === 0) {
    return NextResponse.json(
      { error: "Ödeme güncellenemedi (süresi dolmuş veya zaten işlenmiş olabilir)." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
