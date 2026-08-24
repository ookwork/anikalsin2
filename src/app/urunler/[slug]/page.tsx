import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import ProductGallery from "@/components/products/ProductGallery";
import ProductVideo from "@/components/products/ProductVideo";
import ReservationForm from "@/components/booking/ReservationForm";
import { productJsonLd } from "@/lib/jsonld";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, addOns, frames] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.addOn.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.frame.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  const siblingColors = product.modelId
    ? await prisma.product.findMany({
        where: { modelId: product.modelId, isActive: true },
        select: { id: true, slug: true, name: true, colorName: true, colorHex: true, stockCount: true },
        orderBy: { order: "asc" },
      })
    : [];

  const gallery = [
    ...(product.featuredImageUrl ? [product.featuredImageUrl] : []),
    ...product.images.map((img) => img.url),
  ];

  const highlights = [
    "Türkiye'nin her iline ücretsiz teslimat",
    "Kolay kurulum talimatı dahil",
    "Kayıtlar 48 saat içinde dijital teslim",
    product.installmentInfo ?? "Taksit seçenekleri mevcut",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <JsonLd data={productJsonLd(product, gallery)} />

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <ProductGallery images={gallery} alt={product.name} />
          {product.videoUrl && <ProductVideo url={product.videoUrl} />}
        </div>

        <div>
          <h1 className="font-heading text-3xl font-semibold text-burgundy-dark sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-burgundy">{formatPrice(product.price)}</p>
          {product.installmentInfo && <p className="text-sm text-charcoal/50">{product.installmentInfo}</p>}

          <p className="mt-5 text-sm leading-relaxed text-charcoal/75 sm:text-base">{product.description}</p>

          {siblingColors.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-burgundy-dark">Diğer Renk Seçenekleri</p>
              <div className="flex flex-wrap gap-2">
                {siblingColors.map((sibling) => (
                  <Link
                    key={sibling.id}
                    href={`/urunler/${sibling.slug}`}
                    title={`${sibling.colorName ?? sibling.name}${sibling.stockCount < 1 ? " (Stokta yok)" : ""}`}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      sibling.id === product.id
                        ? "border-burgundy bg-burgundy text-on-brand"
                        : "border-burgundy/20 text-charcoal/70 hover:border-burgundy"
                    } ${sibling.stockCount < 1 ? "opacity-50" : ""}`}
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: sibling.colorHex ?? "#cccccc" }}
                    />
                    {sibling.colorName ?? sibling.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <ul className="mt-6 space-y-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-charcoal/75">
                <Check size={16} className="mt-0.5 shrink-0 text-burgundy" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center font-heading text-2xl font-semibold text-burgundy-dark">Rezervasyon Yap</h2>
        <p className="mt-2 text-center text-sm text-charcoal/60">
          Tarih seçin, bilgilerinizi girin — ekibimiz en kısa sürede sizinle iletişime geçsin.
        </p>
        <div className="mt-8">
          <ReservationForm
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            frames={frames}
            addOns={addOns}
          />
        </div>
      </div>
    </div>
  );
}
