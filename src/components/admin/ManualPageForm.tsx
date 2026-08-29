"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import VideoUploader from "@/components/admin/VideoUploader";
import type { ManualPage } from "@/generated/prisma/client";

interface FormState {
  isPublished: boolean;
  setupText: string;
  usageText: string;
  chargeText: string;
  careText: string;
  returnText: string;
  videoUrl: string;
}

export default function ManualPageForm({ productId, initial }: { productId: string; initial: ManualPage | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    isPublished: initial?.isPublished ?? false,
    setupText: initial?.setupText ?? "",
    usageText: initial?.usageText ?? "",
    chargeText: initial?.chargeText ?? "",
    careText: initial?.careText ?? "",
    returnText: initial?.returnText ?? "",
    videoUrl: initial?.videoUrl ?? "",
  });
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
      body: JSON.stringify(form),
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
          checked={form.isPublished}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          className="h-4 w-4 accent-burgundy"
        />
        Sayfayı yayınla (müşteriye link paylaşılabilir hale gelir)
      </label>

      <Textarea
        label="Kurulum"
        hint="Cihaz etkinlik alanına nasıl kuruluyor?"
        value={form.setupText}
        onChange={(e) => setForm((f) => ({ ...f, setupText: e.target.value }))}
      />
      <Textarea
        label="Kullanım"
        hint="Misafirler cihazı nasıl kullanır?"
        value={form.usageText}
        onChange={(e) => setForm((f) => ({ ...f, usageText: e.target.value }))}
      />
      <Textarea
        label="Şarj Durumu"
        value={form.chargeText}
        onChange={(e) => setForm((f) => ({ ...f, chargeText: e.target.value }))}
      />
      <Textarea
        label="Dikkat Edilmesi Gerekenler"
        value={form.careText}
        onChange={(e) => setForm((f) => ({ ...f, careText: e.target.value }))}
      />
      <Textarea
        label="İade Süreci"
        value={form.returnText}
        onChange={(e) => setForm((f) => ({ ...f, returnText: e.target.value }))}
      />
      <FieldWrap label="Video Rehber">
        <VideoUploader value={form.videoUrl} onUploaded={(url) => setForm((f) => ({ ...f, videoUrl: url }))} />
      </FieldWrap>

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
