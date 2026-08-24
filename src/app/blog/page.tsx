import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { LEGACY_BLOG_ROOT_ROUTES } from "@/lib/legacyBlogRoutes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Düğün hazırlığı, anı biriktirme fikirleri ve Anı Kalsın Event'ten haberler.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Düğün İlham Köşesi</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">
          Düğün hazırlığı, anı biriktirme fikirleri ve Anı Kalsın Event&apos;ten haberler.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-charcoal/60">Henüz yazı yayınlanmadı.</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={LEGACY_BLOG_ROOT_ROUTES[post.slug] ?? `/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-burgundy/10 bg-ivory shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-rose-pale">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                {post.publishedAt && (
                  <p className="text-xs text-charcoal/50">{formatDate(post.publishedAt)}</p>
                )}
                <h2 className="mt-2 font-heading text-lg font-semibold text-burgundy-dark">{post.title}</h2>
                {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-charcoal/70">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
