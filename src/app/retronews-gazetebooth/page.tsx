import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { blogPostMetadata } from "@/lib/blog";
import BlogArticle from "@/components/blog/BlogArticle";

const SLUG = "retro-news-gazete-booth";
const PATH = "/retronews-gazetebooth";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const post = await prisma.blogPost.findUnique({ where: { slug: SLUG } });
  return blogPostMetadata(post, PATH);
}

export default async function RetronewsGazeteboothPage() {
  const post = await prisma.blogPost.findUnique({ where: { slug: SLUG } });

  if (!post || !post.isPublished) {
    notFound();
  }

  return <BlogArticle post={post} path={PATH} />;
}
