import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const models = await prisma.productModel.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Yeni Ürün</h1>
      <p className="mt-1 text-sm text-charcoal/60">Kaydettikten sonra galeriye ek görsel yükleyebilirsiniz.</p>
      <div className="mt-6">
        <ProductForm models={models} />
      </div>
    </div>
  );
}
