import type { Metadata } from "next";
import type { BlogPost } from "@/generated/prisma/client";
import { SITE_URL } from "@/lib/jsonld";

export function blogPostMetadata(post: BlogPost | null, path: string): Metadata {
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    alternates: { canonical: `${SITE_URL}${path}` },
  };
}
