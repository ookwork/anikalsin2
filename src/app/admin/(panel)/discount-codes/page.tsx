import { prisma } from "@/lib/prisma";
import DiscountCodesManager from "@/components/admin/DiscountCodesManager";

export default async function AdminDiscountCodesPage() {
  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reservations: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">İndirim Kodları</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Belirlediğiniz oranda veya doğrudan tutar girerek indirim kodu üretin. Müşteriler rezervasyon
        ekranında bu kodu girerek indirimden faydalanabilir.
      </p>
      <div className="mt-6">
        <DiscountCodesManager discountCodes={discountCodes} />
      </div>
    </div>
  );
}
