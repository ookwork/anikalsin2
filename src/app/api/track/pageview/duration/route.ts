import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pageViewDurationSchema } from "@/lib/validations/pageview";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pageViewDurationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  try {
    await prisma.pageView.update({
      where: { id: parsed.data.id },
      data: { durationMs: parsed.data.durationMs },
    });
  } catch {
    // sayfa görüntüleme kaydı yoksa (ör. admin sayfası için oluşturulmadıysa) sessizce yok say
  }

  return NextResponse.json({ ok: true });
}
