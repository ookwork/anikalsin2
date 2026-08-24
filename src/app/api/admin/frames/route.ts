import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { frameSchema } from "@/lib/validations/frame";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const frames = await prisma.frame.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ frames });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = frameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }
  const frame = await prisma.frame.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.isPremium ? parsed.data.price : 0,
      isPremium: parsed.data.isPremium ?? false,
      imageUrl: parsed.data.imageUrl || null,
      isActive: parsed.data.isActive ?? true,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json({ frame }, { status: 201 });
}
