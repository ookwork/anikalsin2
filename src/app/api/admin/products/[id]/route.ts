import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, model: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;

  if (data.slug) {
    const existing = await prisma.product.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 });
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription || null }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.installmentInfo !== undefined && { installmentInfo: data.installmentInfo || null }),
        ...(data.modelId !== undefined && { modelId: data.modelId || null }),
        ...(data.colorName !== undefined && { colorName: data.colorName || null }),
        ...(data.colorHex !== undefined && { colorHex: data.colorHex || null }),
        ...(data.stockCount !== undefined && { stockCount: data.stockCount }),
        ...(data.featuredImageUrl !== undefined && { featuredImageUrl: data.featuredImageUrl || null }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const reservationCount = await prisma.reservation.count({ where: { productId: id } });
  if (reservationCount > 0) {
    const product = await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ product, softDeleted: true });
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
