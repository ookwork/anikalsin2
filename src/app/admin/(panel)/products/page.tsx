import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import ProductsTable from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { order: "asc" }, include: { model: true } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Ürünler</h1>
          <p className="mt-1 text-sm text-charcoal/60">Kiralık anı kayıt telefonu modellerinizi yönetin.</p>
        </div>
        <ButtonLink href="/admin/products/new" size="sm">
          <Plus size={16} /> Yeni Ürün
        </ButtonLink>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
