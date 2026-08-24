import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pageViewCreateSchema } from "@/lib/validations/pageview";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pageViewCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (parsed.data.path.startsWith("/admin")) {
    return NextResponse.json({ id: null }, { status: 200 });
  }

  const pageView = await prisma.pageView.create({
    data: { path: parsed.data.path, visitorId: parsed.data.visitorId },
    select: { id: true },
  });

  return NextResponse.json({ id: pageView.id }, { status: 201 });
}
