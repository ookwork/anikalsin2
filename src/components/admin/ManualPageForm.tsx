"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ManualPage } from "@/generated/prisma/client";

export default function ManualPageForm({ productId, initial }: { productId: string; initial: ManualPage | null }) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/manual`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished, coverImage, content }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kaydedilemedi.");
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <Card className="max-w-2xl space-y-5 p-6">
      <label className="flex items-center gap-2 text-sm font-medium text-charcoal/80">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 accent-burgundy"
        />
        Sayfayı yayınla (müşteriye link paylaşılabilir hale gelir)
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-burgundy-dark">Kapak Görseli (opsiyonel)</p>
        <ImageUploader value={coverImage} onUploaded={setCoverImage} onRemove={() => setCoverImage("")} />
      </div>

      <RichTextEditor
        label="Sayfa İçeriği — başlık, metin, fotoğraf ve video istediğiniz sırayla ekleyebilirsiniz"
        value={content}
        onChange={setContent}
      />

      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        {saved && !saving && <span className="text-sm text-emerald-700">Kaydedildi.</span>}
      </div>
    </Card>
  );
}
