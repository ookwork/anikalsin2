import { NextRequest, NextResponse } from "next/server";
import { checkAvailability, getBookedDateRanges } from "@/lib/availability";
import { expireStalePendingReservations } from "@/lib/payments";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const qty = Number(searchParams.get("qty") ?? "1");

  await expireStalePendingReservations();

  if (!productId) {
    return NextResponse.json({ error: "productId zorunludur." }, { status: 400 });
  }

  if (!start || !end) {
    const bookedRanges = await getBookedDateRanges(productId);
    return NextResponse.json({ bookedRanges });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }

  const result = await checkAvailability(productId, startDate, endDate, qty);
  return NextResponse.json({ available: result.available, remaining: result.remaining });
}
