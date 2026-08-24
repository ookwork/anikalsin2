import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discountCodeSchema } from "@/lib/validations/discountCode";
import { generateUniqueDiscountCode } from "@/lib/discountCodes";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reservations: true } } },
  });
  return NextResponse.json({ discountCodes });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = discountCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }

  const code = await generateUniqueDiscountCode();
  const discountCode = await prisma.discountCode.create({
    data: {
      code,
      type: parsed.data.type,
      value: parsed.data.value,
      isActive: parsed.data.isActive ?? true,
    },
  });
  return NextResponse.json({ discountCode }, { status: 201 });
}
