import { getAllContent } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";

export default async function AdminContentPage() {
  const content = await getAllContent();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Site İçeriği</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Anasayfa, hakkımızda ve iletişim metinlerini buradan düzenleyebilirsiniz.
      </p>
      <div className="mt-6">
        <ContentEditor initialContent={content} />
      </div>
    </div>
  );
}
