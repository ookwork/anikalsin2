import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { expireStalePendingReservations } from "@/lib/payments";
import { getContent } from "@/lib/content";
import { formatDate, formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import PaymentClient from "@/components/booking/PaymentClient";

interface Props {
  params: Promise<{ reference: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false, follow: false },
};

export default async function PaymentPage({ params }: Props) {
  const { reference } = await params;

  await expireStalePendingReservations();

  const payment = await prisma.payment.findUnique({
    where: { referenceCode: reference },
    include: {
      reservation: {
        include: {
          product: { select: { name: true, slug: true, featuredImageUrl: true } },
          addOns: { include: { addOn: { select: { name: true } } } },
          frame: { select: { name: true } },
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  const { reservation } = payment;

  if (payment.status === "PAID") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <CheckCircle2 size={56} className="text-emerald-600" />
        <h1 className="mt-6 font-heading text-3xl font-semibold text-burgundy-dark">Ödemeniz Alındı</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">
          {reservation.product.name} rezervasyonunuz onaylandı. Ekibimiz teslimat detayları için sizinle iletişime
          geçecek.
        </p>
        <div className="mt-6 rounded-2xl border border-burgundy/10 bg-ivory p-5 text-left text-sm text-charcoal/70">
          <p><strong>Referans Kodu:</strong> {payment.referenceCode}</p>
          <p className="mt-1"><strong>Tarih:</strong> {formatDate(reservation.eventDate ?? reservation.rentalStart)}</p>
          <p className="mt-1"><strong>Tutar:</strong> {formatPrice(payment.amount)}</p>
        </div>
        <div className="mt-8">
          <ButtonLink href="/">Anasayfaya Dön</ButtonLink>
        </div>
      </div>
    );
  }

  if (reservation.status === "EXPIRED") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <Clock3 size={56} className="text-charcoal/40" />
        <h1 className="mt-6 font-heading text-3xl font-semibold text-burgundy-dark">Ödeme Süresi Doldu</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">
          Bu rezervasyon için ödeme süresi doldu ve tarih tekrar müsait hale geldi. Lütfen aynı ürün için yeniden
          rezervasyon yapın.
        </p>
        <div className="mt-8">
          <ButtonLink href={`/urunler/${reservation.product.slug}`}>Yeniden Rezervasyon Yap</ButtonLink>
        </div>
      </div>
    );
  }

  const [iban, ibanName] = await Promise.all([
    getContent("payment.iban", ""),
    getContent("payment.ibanName", ""),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Rezervasyon Alındı</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Ödemenizi Tamamlayın</h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/70 sm:text-base">
          Rezervasyonunuzun kesinleşmesi için aşağıdaki süre içinde ödemenizi tamamlayın.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-burgundy/10 bg-ivory p-5 text-sm text-charcoal/75">
        <div className="flex items-center justify-between">
          <span>Ürün</span>
          <span className="font-medium text-burgundy-dark">{reservation.product.name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span>Etkinlik Tarihi</span>
          <span className="font-medium text-burgundy-dark">
            {formatDate(reservation.eventDate ?? reservation.rentalStart)}
          </span>
        </div>
        {reservation.frame && (
          <div className="mt-2 flex items-center justify-between">
            <span>Çerçeve</span>
            <span className="font-medium text-burgundy-dark">{reservation.frame.name}</span>
          </div>
        )}
        {reservation.addOns.length > 0 && (
          <div className="mt-2 flex items-start justify-between">
            <span>Ek Hizmetler</span>
            <span className="text-right font-medium text-burgundy-dark">
              {reservation.addOns.map((a) => a.addOn.name).join(", ")}
            </span>
          </div>
        )}
        {!!reservation.discountAmount && (
          <div className="mt-2 flex items-center justify-between text-emerald-700">
            <span>İndirim</span>
            <span className="font-medium">-{formatPrice(reservation.discountAmount)}</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-burgundy/10 pt-3 text-base">
          <span className="font-semibold text-burgundy-dark">Toplam Tutar</span>
          <span className="font-semibold text-burgundy">{formatPrice(payment.amount)}</span>
        </div>
      </div>

      <PaymentClient
        reference={payment.referenceCode}
        amount={payment.amount}
        expiresAt={payment.expiresAt.toISOString()}
        iban={iban}
        ibanName={ibanName}
      />
    </div>
  );
}
