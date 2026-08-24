import Image from "next/image";
import { PhoneCall, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

interface HeroProps {
  title: string;
  subtitle: string;
  cta: string;
  image?: string;
}

export default function Hero({ title, subtitle, cta, image }: HeroProps) {
  return (
    <section className="relative flex min-h-[560px] items-end overflow-hidden bg-burgundy-dark sm:min-h-[680px] lg:min-h-[85vh]">
      {image && (
        <Image
          src={image}
          alt="Anı Kalsın Event anı telefonu ve telefon kulübesi"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy-dark/90 via-burgundy-dark/40 to-burgundy-dark/10" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-32 sm:px-6 sm:pb-20 sm:pt-40">
        <div className="flex max-w-2xl flex-col items-start gap-6 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-on-brand/30 bg-burgundy-dark/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-on-brand backdrop-blur">
            <Sparkles size={14} className="text-gold-light" />
            Türkiye&apos;nin Her Yerine Teslimat
          </span>

          <h1 className="max-w-xl font-heading text-4xl font-semibold leading-tight text-on-brand sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-on-brand/85 sm:text-lg">{subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/urunler" size="lg">
              <PhoneCall size={18} />
              {cta}
            </ButtonLink>
            <ButtonLink href="/nasil-calisir" variant="secondary" size="lg">
              Nasıl Çalışır?
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
