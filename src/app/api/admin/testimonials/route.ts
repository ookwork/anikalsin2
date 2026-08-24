import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/content";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }
  const testimonial = await prisma.testimonial.create({
    data: {
      authorName: parsed.data.authorName,
      authorLocation: parsed.data.authorLocation || null,
      content: parsed.data.content,
      rating: parsed.data.rating ?? 5,
      avatarUrl: parsed.data.avatarUrl || null,
      isActive: parsed.data.isActive ?? true,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json({ testimonial }, { status: 201 });
}
