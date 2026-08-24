import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productModelSchema } from "@/lib/validations/productModel";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productModelSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }
  try {
    const model = await prisma.productModel.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.slug !== undefined && { slug: parsed.data.slug }),
      },
    });
    return NextResponse.json({ model });
  } catch {
    return NextResponse.json({ error: "Model bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.productModel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
