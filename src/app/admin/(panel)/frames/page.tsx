import { prisma } from "@/lib/prisma";
import FramesManager from "@/components/admin/FramesManager";

export default async function AdminFramesPage() {
  const frames = await prisma.frame.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Çerçeveler</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Rezervasyon sırasında zorunlu olarak seçilen çerçeve tasarımlarını yönetin. 3 standart tasarım ücretsiz,
        özel tasarımlar ücretlidir.
      </p>
      <div className="mt-6">
        <FramesManager frames={frames} />
      </div>
    </div>
  );
}
