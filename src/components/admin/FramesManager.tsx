"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Loader2, Frame as FrameIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { formatPrice } from "@/lib/format";
import type { Frame } from "@/generated/prisma/client";

export default function FramesManager({ frames }: { frames: Frame[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const freeFrames = frames.filter((f) => !f.isPremium);
  const premiumFrames = frames.filter((f) => f.isPremium);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/frames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        isPremium,
        price: isPremium ? Number(price) : 0,
        imageUrl,
        order: frames.length,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eklenemedi.");
      return;
    }
    setName("");
    setDescription("");
    setIsPremium(false);
    setPrice("");
    setImageUrl("");
    router.refresh();
  };

  const onToggleActive = async (f: Frame) => {
    await fetch(`/api/admin/frames/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !f.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    setDeleteError(null);
    const res = await fetch(`/api/admin/frames/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Çerçeve silinemedi.");
      return;
    }
    router.refresh();
  };

  const renderFrame = (f: Frame) => (
    <Card key={f.id} className="p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-rose-pale">
          {f.imageUrl && <Image src={f.imageUrl} alt={f.name} fill className="object-cover" sizes="64px" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-burgundy-dark">{f.name}</p>
          {f.description && <p className="mt-0.5 text-xs text-charcoal/70">{f.description}</p>}
          <p className="mt-1 text-sm font-semibold text-burgundy">
            {f.isPremium ? formatPrice(f.price) : "Ücretsiz"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={() => onToggleActive(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
              f.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
            }`}
          >
            {f.isActive ? "Yayında" : "Pasif"}
          </button>
          <button onClick={() => onDelete(f.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {deleteError && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{deleteError}</p>}

        <div>
          <p className="mb-2 text-sm font-semibold text-burgundy-dark">Standart Çerçeveler (Ücretsiz)</p>
          <div className="space-y-3">
            {freeFrames.length === 0 && <p className="text-sm text-charcoal/50">Henüz standart çerçeve eklenmemiş.</p>}
            {freeFrames.map(renderFrame)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-burgundy-dark">Özel Tasarım Çerçeveler (Ücretli)</p>
          <div className="space-y-3">
            {premiumFrames.length === 0 && <p className="text-sm text-charcoal/50">Henüz özel çerçeve eklenmemiş.</p>}
            {premiumFrames.map(renderFrame)}
          </div>
        </div>
      </div>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-burgundy-dark">
          <Plus size={16} /> Yeni Çerçeve Ekle
        </h3>
        <form onSubmit={onAdd} className="mt-4 space-y-3">
          <FieldWrap label="Önizleme Görseli">
            <ImageUploader value={imageUrl} onUploaded={setImageUrl} onRemove={() => setImageUrl("")} />
          </FieldWrap>
          <Input label="İsim" required value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-charcoal/80">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 accent-burgundy"
            />
            Ücretli (özel tasarım)
          </label>
          {isPremium && (
            <Input
              label="Fiyat (TL)"
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
          {error && <p className="text-xs text-red-700">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting} className="w-full">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <FrameIcon size={14} />}
            Ekle
          </Button>
        </form>
      </Card>
    </div>
  );
}
