import type { Metadata } from "next";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu",
  description: "Anı Kalsın Event ön bilgilendirme formu.",
};

export const dynamic = "force-dynamic";

export default async function PreInfoFormPage() {
  const title = await getContent("preInfo.title", "Ön Bilgilendirme Formu");
  const body = await getContent("preInfo.body", "");

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
