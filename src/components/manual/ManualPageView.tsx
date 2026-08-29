import Image from "next/image";
import { Phone } from "lucide-react";
import { sanitizeBlogContent } from "@/lib/sanitizeHtml";

function EmergencyStrip({ phone }: { phone: string }) {
  const tel = phone.replace(/\s/g, "");
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-burgundy-dark p-4 text-on-brand">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-on-brand/15">
        <Phone size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-on-brand/70">
          Etkinlik sırasında bir sorun olursa
        </p>
        <a href={`tel:${tel}`} className="font-heading text-lg font-semibold text-on-brand">
          {phone}
        </a>
      </div>
      <a
        href={`tel:${tel}`}
        className="shrink-0 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-burgundy-dark"
      >
        Hemen Ara
      </a>
    </div>
  );
}

export default function ManualPageView({
  productName,
  coverImage,
  content,
  phone,
}: {
  productName: string;
  coverImage: string | null;
  content: string | null;
  phone: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">Kullanım Kılavuzu</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-burgundy-dark">{productName}</h1>
      </div>

      <div className="mt-6">
        <EmergencyStrip phone={phone} />
      </div>

      {coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-rose-pale">
          <Image src={coverImage} alt={productName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" priority />
        </div>
      )}

      {content && (
        <div
          className="blog-content mt-8 text-sm leading-relaxed text-charcoal/80 sm:text-base"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(content) }}
        />
      )}

      <div className="mt-10 rounded-2xl bg-rose-pale p-5 text-center">
        <p className="mb-1.5 text-sm text-charcoal/70">
          Kurulum, kullanım veya iade ile ilgili herhangi bir sorunuzda:
        </p>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-heading text-2xl font-semibold text-burgundy">
          {phone}
        </a>
      </div>

      <p className="mt-8 text-center text-xs text-charcoal/45">
        <strong className="font-heading text-burgundy">Anı Kalsın Event</strong> — bu kılavuz, {productName}{" "}
        kiralamanız için hazırlanmıştır.
      </p>
    </div>
  );
}
