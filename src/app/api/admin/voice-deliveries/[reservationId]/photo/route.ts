import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/uploads";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ reservationId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { reservationId } = await params;
  const voiceDelivery = await prisma.voiceDelivery.findUnique({ where: { reservationId } });
  if (!voiceDelivery) {
    return NextResponse.json(
      { error: "Önce Drive linkini kaydedip sayfayı oluşturun." },
      { status: 404 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  try {
    const { url } = await storage.save(file);
    if (voiceDelivery.photoUrl) {
      await storage.delete(voiceDelivery.photoUrl);
    }
    const updated = await prisma.voiceDelivery.update({ where: { reservationId }, data: { photoUrl: url } });
    return NextResponse.json({ voiceDelivery: updated }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Görsel yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { reservationId } = await params;
  const voiceDelivery = await prisma.voiceDelivery.findUnique({ where: { reservationId } });
  if (!voiceDelivery) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  if (voiceDelivery.photoUrl) {
    await storage.delete(voiceDelivery.photoUrl);
  }
  const updated = await prisma.voiceDelivery.update({ where: { reservationId }, data: { photoUrl: null } });
  return NextResponse.json({ voiceDelivery: updated });
}
