import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { manualPageSchema } from "@/lib/validations/manualPage";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const manualPage = await prisma.manualPage.findUnique({ where: { productId: id } });
  return NextResponse.json({ manualPage });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = manualPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }

  const data = {
    isPublished: parsed.data.isPublished ?? false,
    coverImage: parsed.data.coverImage || null,
    content: parsed.data.content || null,
  };

  const manualPage = await prisma.manualPage.upsert({
    where: { productId: id },
    update: data,
    create: { productId: id, ...data },
  });

  return NextResponse.json({ manualPage });
}
