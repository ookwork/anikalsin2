import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponValidateSchema } from "@/lib/validations/reservation";
import { computeDiscountAmount } from "@/lib/discountCodes";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const discountCode = await prisma.discountCode.findUnique({
    where: { code: parsed.data.code.trim().toUpperCase() },
  });

  if (!discountCode || !discountCode.isActive) {
    return NextResponse.json({ error: "Bu indirim kodu geçerli değil." }, { status: 404 });
  }

  const discountAmount = computeDiscountAmount(parsed.data.subtotal, discountCode);

  return NextResponse.json({
    code: discountCode.code,
    type: discountCode.type,
    value: discountCode.value,
    discountAmount,
  });
}
