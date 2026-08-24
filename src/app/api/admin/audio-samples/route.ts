import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audioSampleSchema } from "@/lib/validations/audioSample";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const audioSamples = await prisma.audioSample.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ audioSamples });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = audioSampleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }
  const audioSample = await prisma.audioSample.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      audioUrl: parsed.data.audioUrl,
      isActive: parsed.data.isActive ?? true,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json({ audioSample }, { status: 201 });
}
