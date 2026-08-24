import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostForm from "@/components/admin/BlogPostForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">{post.title} Düzenle</h1>
      <div className="mt-6">
        <BlogPostForm initial={post} />
      </div>
    </div>
  );
}
