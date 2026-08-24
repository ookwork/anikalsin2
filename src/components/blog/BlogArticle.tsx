import Image from "next/image";
import type { BlogPost } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { blogPostingJsonLd } from "@/lib/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import { sanitizeBlogContent } from "@/lib/sanitizeHtml";

export default function BlogArticle({ post, path }: { post: BlogPost; path: string }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <JsonLd data={blogPostingJsonLd(post, path)} />

      {post.publishedAt && (
        <p className="text-center text-xs uppercase tracking-wide text-charcoal/50">{formatDate(post.publishedAt)}</p>
      )}
      <h1 className="mt-2 text-center font-heading text-3xl font-semibold text-burgundy-dark sm:text-4xl">
        {post.title}
      </h1>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-rose-pale">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" priority />
        </div>
      )}

      <div
        className="blog-content mt-8 text-sm leading-relaxed text-charcoal/80 sm:text-base"
        dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) }}
      />
    </article>
  );
}
