import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { expireStalePendingReservations } from "@/lib/payments";

type Params = { params: Promise<{ reference: string }> };

const demoCardSchema = z.object({
  cardNumber: z.string().min(12).max(19),
  cardHolder: z.string().min(2),
  expiry: z.string().min(4),
  cvc: z.string().min(3).max(4),
});

export async function POST(request: NextRequest, { params }: Params) {
  const { reference } = await params;
  const body = await request.json().catch(() => null);
  const parsed = demoCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kart bilgileri geçersiz." }, { status: 400 });
  }

  await expireStalePendingReservations();

  const payment = await prisma.payment.findUnique({
    where: { referenceCode: reference },
    include: { reservation: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }
  if (payment.reservation.status === "EXPIRED") {
    return NextResponse.json(
      { error: "Bu rezervasyonun ödeme süresi doldu. Lütfen yeniden rezervasyon yapın." },
      { status: 409 }
    );
  }
  if (payment.status === "PAID") {
    return NextResponse.json({ error: "Bu ödeme zaten alınmış." }, { status: 409 });
  }

  const updatedCount = await prisma.$transaction(async (tx) => {
    const result = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "PAID", method: "CREDIT_CARD_DEMO", paidAt: new Date(), paidVia: "DEMO_CARD" },
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
    return NextResponse.json({ error: "Ödeme alınamadı, lütfen tekrar deneyin." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
