import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productModelSchema } from "@/lib/validations/productModel";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const models = await prisma.productModel.findMany({
    orderBy: { order: "asc" },
    include: { products: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ models });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.productModel.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 });
  }

  const model = await prisma.productModel.create({
    data: { name: parsed.data.name, slug: parsed.data.slug },
  });
  return NextResponse.json({ model }, { status: 201 });
}
