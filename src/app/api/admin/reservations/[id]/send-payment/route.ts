import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueReferenceCode, getPaymentWindowHours } from "@/lib/payments";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      product: { select: { price: true } },
      payment: { select: { id: true } },
      addOns: { select: { priceAtBooking: true } },
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı." }, { status: 404 });
  }
  if (reservation.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Ödeme bilgisi yalnızca onaylanmış rezervasyonlar için gönderilebilir." },
      { status: 400 }
    );
  }
  if (reservation.payment) {
    return NextResponse.json({ error: "Bu rezervasyon için ödeme bilgisi zaten oluşturulmuş." }, { status: 409 });
  }

  const addOnsTotal = reservation.addOns.reduce((sum, a) => sum + a.priceAtBooking, 0);
  const totalAmount = Math.max(
    0,
    reservation.product.price +
      addOnsTotal +
      (reservation.framePriceAtBooking ?? 0) -
      (reservation.discountAmount ?? 0)
  );
  const windowHours = await getPaymentWindowHours();

  const referenceCode = await generateUniqueReferenceCode();
  await prisma.payment.create({
    data: {
      reservationId: reservation.id,
      referenceCode,
      amount: totalAmount,
      expiresAt: new Date(Date.now() + windowHours * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ reference: referenceCode }, { status: 201 });
}
