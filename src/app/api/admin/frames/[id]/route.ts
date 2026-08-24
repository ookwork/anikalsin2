import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { frameSchema } from "@/lib/validations/frame";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = frameSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }

  const existing = await prisma.frame.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Çerçeve bulunamadı." }, { status: 404 });
  }

  const isPremium = parsed.data.isPremium ?? existing.isPremium;
  const price = isPremium ? (parsed.data.price ?? existing.price) : 0;

  try {
    const frame = await prisma.frame.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description || null }),
        price,
        isPremium,
        ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
    });
    return NextResponse.json({ frame });
  } catch {
    return NextResponse.json({ error: "Çerçeve bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.frame.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
