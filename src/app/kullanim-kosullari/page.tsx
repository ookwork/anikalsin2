import type { Metadata } from "next";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Anı Kalsın Event kiralama, ödeme ve iptal koşulları.",
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const title = await getContent("terms.title", "Kullanım Koşulları");
  const body = await getContent("terms.body", "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Yasal</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">{title}</h1>
      </div>
      <div className="mt-10 whitespace-pre-line text-sm leading-relaxed text-charcoal/75 sm:text-base">{body}</div>
    </div>
  );
}
