import { ButtonLink } from "@/components/ui/Button";
import { Heart } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-burgundy px-8 py-16 text-center">
        <Heart className="mx-auto text-gold-light" size={32} fill="currentColor" strokeWidth={0} />
        <h2 className="mt-4 font-heading text-3xl font-semibold text-on-brand sm:text-4xl">
          Düğününüzün Sesini Bugün Rezerve Edin
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-rose-pale sm:text-base">
          Yerler sınırlı — özellikle hafta sonu düğünleri için erken rezervasyon öneriyoruz.
        </p>
        <div className="mt-8">
          <ButtonLink href="/urunler" variant="secondary" size="lg">
            Modelleri İncele
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
