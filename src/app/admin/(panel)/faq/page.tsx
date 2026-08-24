import { prisma } from "@/lib/prisma";
import FaqManager from "@/components/admin/FaqManager";

export default async function AdminFaqPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Sıkça Sorulan Sorular</h1>
      <p className="mt-1 text-sm text-charcoal/60">Sitede gösterilen S.S.S. içeriğini yönetin.</p>
      <div className="mt-6">
        <FaqManager faqs={faqs} />
      </div>
    </div>
  );
}
