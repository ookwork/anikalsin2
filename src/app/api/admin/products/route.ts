import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: {
      images: { orderBy: { order: "asc" } },
      _count: { select: { reservations: true } },
      model: true,
    },
  });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription || null,
      description: parsed.data.description,
      price: parsed.data.price,
      installmentInfo: parsed.data.installmentInfo || null,
      modelId: parsed.data.modelId || null,
      colorName: parsed.data.colorName || null,
      colorHex: parsed.data.colorHex || null,
      stockCount: parsed.data.stockCount,
      featuredImageUrl: parsed.data.featuredImageUrl || null,
      videoUrl: parsed.data.videoUrl || null,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      isActive: parsed.data.isActive ?? true,
      order: parsed.data.order ?? 0,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
