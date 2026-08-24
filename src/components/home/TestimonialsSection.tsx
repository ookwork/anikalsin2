import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/generated/prisma/client";

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-rose-pale/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">Mutlu Çiftler</p>
          <h2 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Bizi Tercih Edenler Ne Diyor?</h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col rounded-3xl border border-burgundy/10 bg-ivory p-6 shadow-sm">
              <Quote className="text-gold" size={24} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal/80">{t.content}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-burgundy-dark">{t.authorName}</p>
                  {t.authorLocation && <p className="text-xs text-charcoal/50">{t.authorLocation}</p>}
                </div>
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
