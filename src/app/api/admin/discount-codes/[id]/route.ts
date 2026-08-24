import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const toggleSchema = z.object({ isActive: z.boolean() });

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }
  try {
    const discountCode = await prisma.discountCode.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
    });
    return NextResponse.json({ discountCode });
  } catch {
    return NextResponse.json({ error: "İndirim kodu bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.discountCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
