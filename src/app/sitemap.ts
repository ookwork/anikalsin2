import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/jsonld";
import { LEGACY_BLOG_ROOT_ROUTES } from "@/lib/legacyBlogRoutes";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/urunler", changeFrequency: "weekly", priority: 0.9 },
  { path: "/nasil-calisir", changeFrequency: "monthly", priority: 0.6 },
  { path: "/sss", changeFrequency: "monthly", priority: 0.6 },
  { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.5 },
  { path: "/iletisim", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/urunler/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}${LEGACY_BLOG_ROOT_ROUTES[p.slug] ?? `/blog/${p.slug}`}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
