import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getContent } from "@/lib/content";
import ManualPageView from "@/components/manual/ManualPageView";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: `${product.name} — Nasıl Kullanılır`,
    robots: { index: false, follow: false },
  };
}

export default async function ManualPagePublic({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const manualPage = await prisma.manualPage.findUnique({
    where: { productId: product.id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!manualPage || !manualPage.isPublished) notFound();

  const phone = await getContent("contact.phone", "0850 000 00 00");

  return <ManualPageView productName={product.name} manualPage={manualPage} phone={phone} />;
}
