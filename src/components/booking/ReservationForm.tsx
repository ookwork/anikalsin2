"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CalendarRange, Sparkles, CheckCircle2, Frame as FrameIcon, Tag, X, ShieldCheck, ZoomIn } from "lucide-react";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button, ButtonLink } from "@/components/ui/Button";
import PaymentBadges from "@/components/payments/PaymentBadges";
import { formatDate, formatPrice, slugify } from "@/lib/format";
import { computeDiscountAmount } from "@/lib/pricing";
import type { AddOn, Frame, DiscountType } from "@/generated/prisma/client";

interface ReservationFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventCity: string;
  deliveryAddress: string;
  note: string;
}

interface ReservationFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  frames: Frame[];
  addOns: AddOn[];
}

export default function ReservationForm({
  productId,
  productName,
  productPrice,
  frames,
  addOns,
}: ReservationFormProps) {
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(new Set());
  const [frameId, setFrameId] = useState<string>("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: DiscountType; value: number } | null>(
    null
  );
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [frameError, setFrameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>();

  const eventCity = watch("eventCity");
  const isIstanbul = slugify(eventCity ?? "").includes("istanbul");

  const accessories = addOns.filter((a) => a.category === "ACCESSORY");
  const staffServices = addOns.filter((a) => a.category === "STAFF_SERVICE");

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addOnsTotal = useMemo(
    () => addOns.filter((a) => selectedAddOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0),
    [addOns, selectedAddOnIds]
  );
  const framePrice = frames.find((f) => f.id === frameId)?.price ?? 0;
  const subtotal = productPrice + addOnsTotal + framePrice;
  const discountAmount = appliedCoupon ? computeDiscountAmount(subtotal, appliedCoupon) : 0;
  const totalPrice = subtotal - discountAmount;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCouponError(data.error ?? "Kupon uygulanamadı.");
        setCouponLoading(false);
        return;
      }
      setAppliedCoupon({ code: data.code, type: data.type, value: data.value });
      setCouponLoading(false);
    } catch {
      setCouponError("Kupon uygulanırken bir hata oluştu.");
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const onSubmit = async (values: ReservationFormValues) => {
    setSubmitError(null);

    if (!eventDate) {
      setDateError("Lütfen etkinlik tarihinizi seçin.");
      return;
    }
    setDateError(null);

    if (frames.length > 0 && !frameId) {
      setFrameError("Lütfen bir çerçeve seçin.");
      return;
    }
    setFrameError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerEmail: values.customerEmail,
          eventCity: values.eventCity,
          deliveryAddress: values.deliveryAddress,
          note: values.note,
          eventDate: eventDate.toISOString(),
          frameId,
          addOnIds: Array.from(selectedAddOnIds),
          discountCode: appliedCoupon?.code ?? "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "Rezervasyon oluşturulamadı, lütfen tekrar deneyin.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);
    } catch {
      setSubmitError("Bir hata oluştu, lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-burgundy/10 bg-ivory px-6 py-14 text-center">
        <CheckCircle2 size={56} className="text-emerald-600" />
        <h2 className="mt-6 font-heading text-2xl font-semibold text-burgundy-dark sm:text-3xl">
          Rezervasyon Talebiniz Alındı
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/70 sm:text-base">
          Ekibimiz talebinizi inceleyip onayladıktan sonra ödeme bilgilerini WhatsApp/telefon ile sizinle
          paylaşacaktır. Rezervasyonunuz ödeme tamamlandığında kesinleşir.
        </p>
        <div className="mt-8">
          <ButtonLink href="/">Anasayfaya Dön</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-burgundy-dark">
          <CalendarRange size={16} /> Etkinlik Tarihi
        </p>
        <div className={dateError ? "rounded-2xl ring-2 ring-red-400" : ""}>
          <AvailabilityCalendar productId={productId} selected={eventDate} onSelect={setEventDate} />
        </div>
        {eventDate && (
          <p className="mt-2 text-sm text-charcoal/70">
            Seçilen tarih: <strong>{formatDate(eventDate)}</strong>
          </p>
        )}
        {dateError && <p className="mt-2 text-xs text-red-700">{dateError}</p>}
      </div>

      {frames.length > 0 && (
        <div className="border-t border-burgundy/10 pt-6">
          <p className="mb-1 flex items-center gap-2 text-sm font-medium text-burgundy-dark">
            <FrameIcon size={16} /> Çerçeve Seçimi <span className="text-red-600">*</span>
          </p>
          <p className="mb-3 text-xs text-charcoal/60">
            3 standart çerçeve tasarımımız ücretsizdir, 2 özel tasarım çerçeve ise ek ücretlidir. Devam etmek
            için bir çerçeve seçmelisiniz.
          </p>
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${frameError ? "rounded-2xl p-2 ring-2 ring-red-400" : ""}`}>
            {frames.map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => {
                  setFrameId(f.id);
                  setFrameError(null);
                }}
                className={`flex flex-col overflow-hidden rounded-xl border text-left transition-colors cursor-pointer ${
                  frameId === f.id ? "border-burgundy ring-2 ring-burgundy/30" : "border-burgundy/15 hover:border-burgundy/40"
                }`}
              >
                <div className="relative aspect-square w-full bg-rose-pale">
                  {f.imageUrl && <Image src={f.imageUrl} alt={f.name} fill className="object-cover" sizes="150px" />}
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-medium text-charcoal">{f.name}</p>
                  <p className="text-xs font-semibold text-burgundy">
                    {f.isPremium ? `+${formatPrice(f.price)}` : "Ücretsiz"}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {frameError && <p className="mt-2 text-xs text-red-700">{frameError}</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Ad Soyad"
          placeholder="Adınız Soyadınız"
          {...register("customerName", { required: "Ad soyad zorunludur." })}
          error={errors.customerName?.message}
        />
        <Input
          label="Telefon"
          type="tel"
          placeholder="05xx xxx xx xx"
          {...register("customerPhone", { required: "Telefon numarası zorunludur." })}
          error={errors.customerPhone?.message}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="E-posta (opsiyonel)"
          type="email"
          placeholder="ornek@eposta.com"
          {...register("customerEmail")}
        />
        <Input
          label="Etkinlik Şehri"
          placeholder="Örn. İstanbul"
          {...register("eventCity", { required: "Etkinlik şehri zorunludur." })}
          error={errors.eventCity?.message}
        />
      </div>

      <Textarea
        label="Teslimat Adresi"
        placeholder="Cihazın gönderileceği açık adres"
        {...register("deliveryAddress", { required: "Teslimat adresi zorunludur." })}
        error={errors.deliveryAddress?.message}
      />

      {(accessories.length > 0 || staffServices.length > 0) && (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-burgundy-dark">
            <Sparkles size={16} /> Ek Hizmetler
          </p>
          <div className="space-y-2">
            {accessories.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-burgundy/15 bg-ivory px-4 py-3 hover:border-burgundy/40"
              >
                <span className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedAddOnIds.has(a.id)}
                    onChange={() => toggleAddOn(a.id)}
                    className="mt-0.5 h-4 w-4 accent-burgundy"
                  />
                  {a.imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLightboxImage(a.imageUrl);
                      }}
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-burgundy/15 cursor-zoom-in"
                      title="Büyütmek için tıklayın"
                    >
                      <Image src={a.imageUrl} alt={a.name} fill className="object-cover" sizes="44px" />
                      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 text-transparent hover:bg-charcoal/30 hover:text-white">
                        <ZoomIn size={14} />
                      </span>
                    </button>
                  )}
                  <span>
                    <span className="block text-sm font-medium text-charcoal">{a.name}</span>
                    {a.description && <span className="block text-xs text-charcoal/60">{a.description}</span>}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-burgundy">+{formatPrice(a.price)}</span>
              </label>
            ))}

            {staffServices.map((a) => (
              <label
                key={a.id}
                className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 ${
                  isIstanbul
                    ? "cursor-pointer border-burgundy/15 bg-ivory hover:border-burgundy/40"
                    : "cursor-not-allowed border-burgundy/10 bg-cream/60 opacity-60"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedAddOnIds.has(a.id)}
                    disabled={!isIstanbul}
                    onChange={() => toggleAddOn(a.id)}
                    className="mt-0.5 h-4 w-4 accent-burgundy"
                  />
                  {a.imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLightboxImage(a.imageUrl);
                      }}
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-burgundy/15 cursor-zoom-in"
                      title="Büyütmek için tıklayın"
                    >
                      <Image src={a.imageUrl} alt={a.name} fill className="object-cover" sizes="44px" />
                      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 text-transparent hover:bg-charcoal/30 hover:text-white">
                        <ZoomIn size={14} />
                      </span>
                    </button>
                  )}
                  <span>
                    <span className="block text-sm font-medium text-charcoal">{a.name}</span>
                    {a.description && <span className="block text-xs text-charcoal/60">{a.description}</span>}
                    <span className="mt-0.5 block text-xs font-medium text-gold">
                      Bu hizmet sadece İstanbul&apos;daki etkinlikler için geçerlidir.
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-burgundy">+{formatPrice(a.price)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Textarea label="Not (opsiyonel)" placeholder="Eklemek istediğiniz bir not var mı?" {...register("note")} />

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-burgundy-dark">
          <Tag size={16} /> İndirim Kuponu (opsiyonel)
        </p>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <span className="text-sm font-medium text-emerald-800">
              &quot;{appliedCoupon.code}&quot; uygulandı — {formatPrice(discountAmount)} indirim
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              className="rounded-full p-1 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
              placeholder="İndirim kodunuz varsa girin"
              className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            />
            <Button type="button" variant="outline" size="sm" disabled={couponLoading} onClick={applyCoupon}>
              {couponLoading && <Loader2 size={14} className="animate-spin" />}
              Uygula
            </Button>
          </div>
        )}
        {couponError && <p className="mt-1 text-xs text-red-700">{couponError}</p>}
      </div>

      <div className="rounded-xl bg-rose-pale px-4 py-3">
        {discountAmount > 0 && (
          <div className="mb-1.5 flex items-center justify-between text-sm text-charcoal/60">
            <span>Ara Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="mb-1.5 flex items-center justify-between text-sm text-emerald-700">
            <span>İndirim</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-burgundy-dark">Toplam Tutar</span>
          <span className="text-lg font-semibold text-burgundy">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-charcoal/60">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-burgundy" />
        Rezervasyonunuz onaylandıktan sonra size özel bir ödeme sayfası açılır; ödemenizi banka havalesi/EFT
        veya kredi kartı ile güvenli şekilde tamamlayabilirsiniz.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-charcoal/50">
          <Link href="/mesafeli-satis-sozlesmesi" className="underline hover:text-burgundy">
            Mesafeli Kiralama Sözleşmesi
          </Link>
          <span>·</span>
          <Link href="/on-bilgilendirme-formu" className="underline hover:text-burgundy">
            Ön Bilgilendirme Formu
          </Link>
          <span>·</span>
          <Link href="/kvkk-aydinlatma-metni" className="underline hover:text-burgundy">
            KVKK Aydınlatma Metni
          </Link>
          <span>·</span>
          <Link href="/kullanim-kosullari" className="underline hover:text-burgundy">
            Kullanım Koşulları
          </Link>
        </p>
        <PaymentBadges />
      </div>

      {submitError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Gönderiliyor..." : `${productName} için Rezervasyon Yap`}
      </Button>
    </form>
    <Modal open={!!lightboxImage} onClose={() => setLightboxImage(null)}>
      {lightboxImage && (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-rose-pale">
          <Image src={lightboxImage} alt="" fill className="object-contain" sizes="500px" />
        </div>
      )}
    </Modal>
    </>
  );
}
