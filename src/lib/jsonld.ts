import type { Product, BlogPost } from "@/generated/prisma/client";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://anikalsin.com.tr";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Anıkalsın Event",
    url: SITE_URL,
    logo: `${SITE_URL}/images/1.png`,
    description:
      "Düğün, nişan ve özel günlerde kullanılan sesli anı telefonu, telefon kulübesi ve etkinlik ekipmanı kiralama hizmeti. Türkiye geneli kargo ile teslimat.",
    areaServed: "TR",
  };
}

export function productJsonLd(product: Product, images: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    image: images.map((img) => (img.startsWith("http") ? img : `${SITE_URL}${img}`)),
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: product.price,
      availability: product.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/urunler/${product.slug}`,
    },
  };
}

export function blogPostingJsonLd(post: BlogPost, path: string = `/blog/${post.slug}`) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.metaDescription || undefined,
    image: post.coverImage ? [post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${SITE_URL}${path}`,
  };
}
