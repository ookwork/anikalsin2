import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audioSampleSchema } from "@/lib/validations/audioSample";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = audioSampleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }
  try {
    const audioSample = await prisma.audioSample.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description || null }),
        ...(parsed.data.audioUrl !== undefined && { audioUrl: parsed.data.audioUrl }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
    });
    return NextResponse.json({ audioSample });
  } catch {
    return NextResponse.json({ error: "Ses örneği bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.audioSample.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
