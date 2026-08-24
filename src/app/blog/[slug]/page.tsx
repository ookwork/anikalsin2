import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { blogPostMetadata } from "@/lib/blog";
import BlogArticle from "@/components/blog/BlogArticle";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  return blogPostMetadata(post, `/blog/${slug}`);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) {
    notFound();
  }

  return <BlogArticle post={post} path={`/blog/${slug}`} />;
}
