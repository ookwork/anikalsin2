import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.blockedDate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kapalı tarih bulunamadı." }, { status: 404 });
  }
}
