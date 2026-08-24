import ProductCard from "@/components/products/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import type { Product } from "@/generated/prisma/client";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Modellerimiz</p>
        <h2 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Düğününüze Uygun Modeli Seçin</h2>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <ButtonLink href="/urunler" variant="outline">
          Tüm Ürünleri Gör
        </ButtonLink>
      </div>
    </section>
  );
}
