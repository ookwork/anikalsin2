import { NextRequest, NextResponse } from "next/server";
import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { blockedDateSchema } from "@/lib/validations/blockedDate";
import { requireAdmin } from "@/lib/auth";

const MAX_RANGE_DAYS = 366;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const blockedDates = await prisma.blockedDate.findMany({ orderBy: { date: "asc" } });

  const productIds = Array.from(new Set(blockedDates.map((b) => b.productId).filter((v): v is string => !!v)));
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } })
    : [];
  const productNameById = new Map(products.map((p) => [p.id, p.name]));

  return NextResponse.json({
    blockedDates: blockedDates.map((b) => ({
      ...b,
      productName: b.productId ? productNameById.get(b.productId) ?? null : null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = blockedDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }

  const start = startOfDay(parsed.data.startDate);
  const end = startOfDay(parsed.data.endDate);
  const dayCount = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  if (dayCount > MAX_RANGE_DAYS) {
    return NextResponse.json({ error: "Tarih aralığı çok geniş." }, { status: 400 });
  }

  const productId = parsed.data.productId || null;
  const reason = parsed.data.reason || null;

  const dates = Array.from({ length: dayCount }, (_, i) => addDays(start, i));
  await prisma.blockedDate.createMany({
    data: dates.map((date) => ({ date, productId, reason })),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
