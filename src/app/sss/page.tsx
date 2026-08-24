import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FaqAccordion from "@/components/home/FaqAccordion";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Sesli anı telefonu ve telefon kulübesi kiralama hakkında merak edilenler.",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });

  return (
    <div className="py-8">
      <FaqAccordion faqs={faqs} />
    </div>
  );
}
