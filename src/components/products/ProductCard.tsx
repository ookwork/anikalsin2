import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/generated/prisma/client";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/urunler/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-burgundy/10 bg-ivory shadow-sm transition-shadow hover:shadow-lg hover:shadow-burgundy/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-rose-pale">
        {product.featuredImageUrl && (
          <Image
            src={product.featuredImageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-semibold text-burgundy-dark">{product.name}</h3>
        {product.colorName && (
          <span className="mt-1 flex w-fit items-center gap-1.5 text-xs font-medium text-charcoal/60">
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: product.colorHex ?? "#cccccc" }}
            />
            {product.colorName}
          </span>
        )}
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">{product.shortDescription}</p>
        )}
        <div className="mt-4 flex flex-1 items-end justify-between">
          <div>
            <p className="text-lg font-semibold text-burgundy">{formatPrice(product.price)}</p>
            {product.installmentInfo && <p className="text-xs text-charcoal/50">{product.installmentInfo}</p>}
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-burgundy transition-transform group-hover:translate-x-1">
            Detay <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
