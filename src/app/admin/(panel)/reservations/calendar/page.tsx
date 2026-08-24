import { prisma } from "@/lib/prisma";
import ReservationCalendar from "@/components/admin/ReservationCalendar";

export default async function ReservationCalendarPage() {
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Rezervasyon Takvimi</h1>
      <p className="mt-1 text-sm text-charcoal/60">Ürün seçip müsaitlik durumunu görüntüleyin.</p>

      <div className="mt-6">
        {products.length === 0 ? (
          <p className="text-charcoal/60">Önce bir ürün ekleyin.</p>
        ) : (
          <ReservationCalendar products={products} />
        )}
      </div>
    </div>
  );
}
