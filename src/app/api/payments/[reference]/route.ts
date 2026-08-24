import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expireStalePendingReservations } from "@/lib/payments";
import { getContent } from "@/lib/content";

type Params = { params: Promise<{ reference: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { reference } = await params;

  await expireStalePendingReservations();

  const payment = await prisma.payment.findUnique({
    where: { referenceCode: reference },
    include: {
      reservation: {
        include: {
          product: { select: { name: true, slug: true, featuredImageUrl: true } },
          addOns: { include: { addOn: { select: { name: true } } } },
        },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  const [iban, ibanName] = await Promise.all([
    getContent("payment.iban", ""),
    getContent("payment.ibanName", ""),
  ]);

  return NextResponse.json({ payment, iban, ibanName });
}
