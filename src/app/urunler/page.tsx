import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";

export const metadata: Metadata = {
  title: "Ürünlerimiz",
  description: "Düğününüz için anı kayıt telefonu modellerimizi inceleyin ve rezervasyon yapın.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Modellerimiz</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Anı Kayıt Telefonlarımız</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">
          Her model özenle seçilmiş renk ve tasarımlarıyla düğününüze eşlik eder. Tarih seçip hemen rezervasyon
          yapabilirsiniz.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-charcoal/60">Şu anda listelenecek ürün bulunmuyor.</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
