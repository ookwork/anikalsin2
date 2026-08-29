import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ManualPageForm from "@/components/admin/ManualPageForm";
import ManualPageGalleryManager from "@/components/admin/ManualPageGalleryManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductManualPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const manualPage = await prisma.manualPage.findUnique({
    where: { productId: id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">{product.name} — Nasıl Kullanılır</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Bu sayfa müşteriye kiralama sonrası link olarak paylaşılır.
        {manualPage?.isPublished && (
          <>
            {" "}
            <Link
              href={`/nasil-kullanilir/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-medium text-burgundy hover:underline"
            >
              Sayfayı görüntüle <ExternalLink size={13} />
            </Link>
          </>
        )}
      </p>

      <div className="mt-6">
        <ManualPageForm productId={product.id} initial={manualPage} />
      </div>

      <div className="mt-6 max-w-2xl">
        <ManualPageGalleryManager productId={product.id} images={manualPage?.images ?? []} />
      </div>
    </div>
  );
}
