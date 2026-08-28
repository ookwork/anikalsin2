import { prisma } from "@/lib/prisma";
import BlockedDatesManager from "@/components/admin/BlockedDatesManager";

export default async function AdminBlockedDatesPage() {
  const [blockedDates, products] = await Promise.all([
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
    prisma.product.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  const productNameById = new Map(products.map((p) => [p.id, p.name]));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Kapalı Tarihler</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Rezervasyona kapatmak istediğiniz tarihleri buradan yönetin. Onaylanan rezervasyonların etkinlik
        tarihi ±4 gün otomatik olarak kapanır; burada eklediğiniz tarihler ise ek olarak manuel kapatılır.
      </p>
      <div className="mt-6">
        <BlockedDatesManager
          products={products}
          blockedDates={blockedDates.map((b) => ({
            id: b.id,
            date: b.date.toISOString(),
            productId: b.productId,
            productName: b.productId ? productNameById.get(b.productId) ?? null : null,
            reason: b.reason,
          }))}
        />
      </div>
    </div>
  );
}
