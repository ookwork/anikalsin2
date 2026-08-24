import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/content";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(parsed.data.authorName !== undefined && { authorName: parsed.data.authorName }),
        ...(parsed.data.authorLocation !== undefined && { authorLocation: parsed.data.authorLocation || null }),
        ...(parsed.data.content !== undefined && { content: parsed.data.content }),
        ...(parsed.data.rating !== undefined && { rating: parsed.data.rating }),
        ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl || null }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
    });
    return NextResponse.json({ testimonial });
  } catch {
    return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
