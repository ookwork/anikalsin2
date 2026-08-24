import { prisma } from "@/lib/prisma";
import AddOnsManager from "@/components/admin/AddOnsManager";

export default async function AdminAddOnsPage() {
  const addOns = await prisma.addOn.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Ek Hizmetler</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Rezervasyon formunda gösterilen aksesuar ve personel hizmeti seçeneklerini yönetin.
      </p>
      <div className="mt-6">
        <AddOnsManager addOns={addOns} />
      </div>
    </div>
  );
}
