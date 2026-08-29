import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getVoiceSession } from "@/lib/voiceSession";
import { voiceUnlockSchema } from "@/lib/validations/voiceDelivery";

type Params = { params: Promise<{ accessToken: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { accessToken } = await params;
  const body = await request.json().catch(() => null);
  const parsed = voiceUnlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Şifre giriniz." }, { status: 400 });
  }

  const voiceDelivery = await prisma.voiceDelivery.findUnique({ where: { accessToken } });
  if (!voiceDelivery || !voiceDelivery.isActive) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, voiceDelivery.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  const session = await getVoiceSession();
  const unlocked = new Set(session.unlockedTokens ?? []);
  unlocked.add(accessToken);
  session.unlockedTokens = Array.from(unlocked);
  await session.save();

  return NextResponse.json({ ok: true });
}
