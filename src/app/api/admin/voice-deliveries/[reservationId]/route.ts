import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { generateAccessToken, generatePassword } from "@/lib/voiceDelivery";
import { voiceDeliverySchema } from "@/lib/validations/voiceDelivery";

type Params = { params: Promise<{ reservationId: string }> };

async function generateUniqueAccessToken() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateAccessToken();
    const existing = await prisma.voiceDelivery.findUnique({ where: { accessToken: token } });
    if (!existing) return token;
  }
  throw new Error("Erişim kodu üretilemedi.");
}

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { reservationId } = await params;
  const voiceDelivery = await prisma.voiceDelivery.findUnique({ where: { reservationId } });
  return NextResponse.json({ voiceDelivery });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { reservationId } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = voiceDeliverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }

  const existing = await prisma.voiceDelivery.findUnique({ where: { reservationId } });

  let plainPassword: string | undefined;
  let passwordHash = existing?.passwordHash;
  if (!existing || parsed.data.resetPassword) {
    plainPassword = generatePassword();
    passwordHash = await hashPassword(plainPassword);
  }

  const data = {
    driveUrl: parsed.data.driveUrl || null,
    message: parsed.data.message || null,
    ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
    passwordHash: passwordHash as string,
  };

  const voiceDelivery = existing
    ? await prisma.voiceDelivery.update({ where: { reservationId }, data })
    : await prisma.voiceDelivery.create({
        data: {
          reservationId,
          accessToken: await generateUniqueAccessToken(),
          ...data,
        },
      });

  return NextResponse.json({ voiceDelivery, plainPassword });
}
