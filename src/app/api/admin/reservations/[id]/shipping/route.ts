import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shippingUpdateSchema } from "@/lib/validations/reservation";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = shippingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }

  try {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        shippingCarrier: parsed.data.shippingCarrier || null,
        shippingTrackingNumber: parsed.data.shippingTrackingNumber || null,
        shippingDate: parsed.data.shippingDate || null,
      },
    });
    return NextResponse.json({ reservation });
  } catch {
    return NextResponse.json({ error: "Rezervasyon bulunamadı." }, { status: 404 });
  }
}
