"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/generated/prisma/client";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Merak Edilenler</p>
        <h2 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Sıkça Sorulan Sorular</h2>
      </div>

      <div className="mt-10 space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="overflow-hidden rounded-2xl border border-burgundy/10 bg-ivory">
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer"
              >
                <span className="font-medium text-burgundy-dark">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-burgundy transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && <p className="px-6 pb-4 text-sm leading-relaxed text-charcoal/70">{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
