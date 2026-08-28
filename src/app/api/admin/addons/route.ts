import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addOnSchema } from "@/lib/validations/content";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const addOns = await prisma.addOn.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ addOns });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addOnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }
  const addOn = await prisma.addOn.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      category: parsed.data.category,
      cityRestriction: parsed.data.cityRestriction || null,
      imageUrl: parsed.data.imageUrl || null,
      isActive: parsed.data.isActive ?? true,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json({ addOn }, { status: 201 });
}
