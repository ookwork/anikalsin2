import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import ProductGalleryManager from "@/components/admin/ProductGalleryManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, models] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.productModel.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">{product.name} Düzenle</h1>

      <div className="mt-6">
        <ProductForm initial={product} models={models} />
      </div>

      <div className="mt-10 max-w-2xl">
        <ProductGalleryManager productId={product.id} images={product.images} />
      </div>
    </div>
  );
}
