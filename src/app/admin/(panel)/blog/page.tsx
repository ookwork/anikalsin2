import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import BlogPostsTable from "@/components/admin/BlogPostsTable";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Blog</h1>
          <p className="mt-1 text-sm text-charcoal/60">Blog yazılarınızı yönetin.</p>
        </div>
        <ButtonLink href="/admin/blog/new" size="sm">
          <Plus size={16} /> Yeni Yazı
        </ButtonLink>
      </div>

      <div className="mt-6">
        <BlogPostsTable posts={posts} />
      </div>
    </div>
  );
}
