import type { Metadata } from "next";
import Image from "next/image";
import { CalendarCheck, CreditCard, PhoneOutgoing, Mic, PackageCheck } from "lucide-react";
import { getAllContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const STEP_ICONS = [CalendarCheck, PhoneOutgoing, CreditCard, Mic, PackageCheck];

const STEP_DEFAULTS = [
  {
    title: "1. Cihazınızı Seçin",
    description:
      "Anı telefonu modelini, telefon kulübesini veya sis makinesi, 360 video standı, kamera adam gibi ek hizmetleri seçin.",
  },
  {
    title: "2. Rezervasyon Yapın",
    description:
      "Etkinlik tarihinizi ve teslimat/kurulum adresinizi girerek rezervasyonunuzu birkaç dakikada tamamlayın.",
  },
  {
    title: "3. Ödemenizi Tamamlayın",
    description:
      "Rezervasyon sonrası size özel bir ödeme sayfası açılır. Banka havalesi/EFT veya kredi kartı ile 1 saat içinde ödemenizi tamamlayın — aksi halde tarih tekrar müsait hale gelir.",
  },
  {
    title: "4. Etkinlik Günü Kurulum",
    description:
      "Saha ekibimizin bulunduğu şehirlerde ekibimiz misafirleriniz gelmeden önce alanda olur ve kurulumu yapar; diğer illerde cihazınız kargo ile adresinize ulaşır.",
  },
  {
    title: "5. Misafirleriniz Anılarını Bıraksın",
    description:
      "Ahize kaldırıldığında misafirleriniz dilediği kadar konuşup sesli mesajını kaydedebilir; etkinlik sonrası kayıtlarınızın teslimatı için ekibimiz sizinle iletişime geçer.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAllContent();
  return {
    title: content["howitworks.metaTitle"] || "Nasıl Çalışır?",
    description:
      content["howitworks.metaDescription"] || "Cihaz seçimi, rezervasyon, ödeme ve etkinlik günü sürecimiz adım adım.",
  };
}

export default async function HowItWorksPage() {
  const content = await getAllContent();
  const images = [content["home.gallery.image5"], content["home.gallery.image2"]].filter(
    (img): img is string => Boolean(img)
  );
  const intro =
    content["howitworks.intro"] ||
    "Anı Kalsın ile düğününüzün sesini ölümsüzleştirmek beş basit adımdan oluşur: cihaz seçimi, rezervasyon, ödeme, kurulum ve kullanım.";
  const steps = STEP_DEFAULTS.map((fallback, i) => ({
    icon: STEP_ICONS[i],
    title: content[`howitworks.step${i + 1}.title`] || fallback.title,
    description: content[`howitworks.step${i + 1}.description`] || fallback.description,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Süreç</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Nasıl Çalışır?</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">{intro}</p>
      </div>

      {images.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4">
          {images.map((img) => (
            <div key={img} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-rose-pale">
              <Image src={img} alt="Anikalsin anı kayıt telefonu kullanım anı" fill className="object-cover" sizes="(max-width: 768px) 50vw, 400px" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-14 space-y-8">
        {steps.map((step) => (
          <div key={step.title} className="flex gap-5 rounded-3xl border border-burgundy/10 bg-ivory p-6 sm:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-pale text-burgundy">
              <step.icon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-burgundy-dark">{step.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/70">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
