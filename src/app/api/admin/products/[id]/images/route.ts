import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/uploads";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  try {
    const { url } = await storage.save(file);
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { order: "desc" },
    });
    const image = await prisma.productImage.create({
      data: { productId: id, url, order: (lastImage?.order ?? -1) + 1 },
    });
    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Görsel yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("imageId");
  if (!imageId) {
    return NextResponse.json({ error: "imageId zorunludur." }, { status: 400 });
  }

  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) {
    return NextResponse.json({ error: "Görsel bulunamadı." }, { status: 404 });
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  await storage.delete(image.url);

  return NextResponse.json({ ok: true });
}
