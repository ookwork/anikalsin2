import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Yeni Blog Yazısı</h1>
      <div className="mt-6">
        <BlogPostForm />
      </div>
    </div>
  );
}
