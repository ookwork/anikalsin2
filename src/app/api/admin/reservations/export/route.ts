import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@/generated/prisma/client";
import { toCsv } from "@/lib/csv";
import { formatDateRange, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = new Set(Object.values(ReservationStatus));

const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal",
  EXPIRED: "Süresi Doldu",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  EXPIRED: "Süresi Doldu",
  FAILED: "Başarısız",
};

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const validStatus = status && VALID_STATUSES.has(status as ReservationStatus) ? (status as ReservationStatus) : undefined;

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(q
        ? {
            OR: [
              { customerPhone: { contains: q } },
              { payment: { referenceCode: { contains: q.toUpperCase() } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, price: true } },
      payment: { select: { referenceCode: true, status: true, amount: true } },
      addOns: { include: { addOn: { select: { name: true } } } },
    },
  });

  const rows = reservations.map((r) => ({
    Tarih: new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(r.createdAt),
    "Müşteri Adı": r.customerName,
    Telefon: r.customerPhone,
    "E-posta": r.customerEmail ?? "",
    Şehir: r.eventCity ?? "",
    "Teslimat Adresi": r.deliveryAddress ?? "",
    Ürün: r.product.name,
    "Tarih Aralığı": formatDateRange(r.rentalStart, r.rentalEnd),
    "Ek Hizmetler": r.addOns.map((a) => a.addOn.name).join("; "),
    Tutar: formatPrice(r.payment?.amount ?? r.product.price),
    "Rezervasyon Durumu": RESERVATION_STATUS_LABELS[r.status] ?? r.status,
    "Ödeme Durumu": r.payment ? PAYMENT_STATUS_LABELS[r.payment.status] ?? r.payment.status : "-",
    "Ödeme Referansı": r.payment?.referenceCode ?? "",
    Not: r.note ?? "",
  }));

  const csv = toCsv(rows);
  const filename = `rezervasyonlar-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
