"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { ManualPageImage } from "@/generated/prisma/client";

export default function ManualPageGalleryManager({
  productId,
  images,
}: {
  productId: string;
  images: ManualPageImage[];
}) {
  const router = useRouter();

  const handleRemove = async (imageId: string) => {
    await fetch(`/api/admin/products/${productId}/manual/images?imageId=${imageId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-burgundy-dark">Kurulum Görselleri</p>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-xl border border-burgundy/15">
            <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />
            <button
              onClick={() => handleRemove(img.id)}
              className="absolute right-1 top-1 rounded-full bg-charcoal/70 p-1 text-white cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <ImageUploader
          uploadUrl={`/api/admin/products/${productId}/manual/images`}
          onUploaded={() => router.refresh()}
          label="Galeriye Ekle"
        />
      </div>
    </div>
  );
}
