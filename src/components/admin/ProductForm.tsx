"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Input, Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoUploader from "@/components/admin/VideoUploader";
import { slugify } from "@/lib/format";
import type { Product, ProductModel } from "@/generated/prisma/client";

interface ProductFormProps {
  initial?: Product;
  models: ProductModel[];
}

export default function ProductForm({ initial, models: initialModels }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [models, setModels] = useState(initialModels);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [installmentInfo, setInstallmentInfo] = useState(initial?.installmentInfo ?? "");
  const [stockCount, setStockCount] = useState(initial?.stockCount?.toString() ?? "1");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initial?.featuredImageUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [modelId, setModelId] = useState(initial?.modelId ?? "");
  const [colorName, setColorName] = useState(initial?.colorName ?? "");
  const [colorHex, setColorHex] = useState(initial?.colorHex ?? "#b91c5c");
  const [newModelName, setNewModelName] = useState("");
  const [creatingModel, setCreatingModel] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onCreateModel = async () => {
    const name = newModelName.trim();
    if (!name) return;
    setCreatingModel(true);
    setModelError(null);
    const res = await fetch("/api/admin/product-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    setCreatingModel(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setModelError(data.error ?? "Model oluşturulamadı.");
      return;
    }
    const { model } = await res.json();
    setModels((prev) => [...prev, model]);
    setModelId(model.id);
    setNewModelName("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name,
      slug,
      shortDescription,
      description,
      price: Number(price),
      installmentInfo,
      modelId: modelId || undefined,
      colorName,
      colorHex,
      stockCount: Number(stockCount),
      featuredImageUrl,
      videoUrl,
      metaTitle,
      metaDescription,
      isActive,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kaydedilemedi.");
      setSubmitting(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-burgundy-dark">Öne Çıkan Görsel</p>
        <ImageUploader
          value={featuredImageUrl}
          onUploaded={setFeaturedImageUrl}
          onRemove={() => setFeaturedImageUrl("")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Ürün Adı"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
        <Input
          label="Slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          hint="URL'de görünür: /urunler/slug"
        />
      </div>

      <Input
        label="Kısa Açıklama"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        hint="Ürün kartlarında görünür, kısa tutun."
      />

      <Textarea
        label="Detaylı Açıklama"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Fiyat (TL)"
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          label="Stok Adedi"
          type="number"
          min={1}
          required
          value={stockCount}
          onChange={(e) => setStockCount(e.target.value)}
        />
        <Input
          label="Taksit Bilgisi"
          value={installmentInfo}
          onChange={(e) => setInstallmentInfo(e.target.value)}
          placeholder="Örn. 3 taksit imkanı"
        />
      </div>

      <div className="rounded-2xl border border-burgundy/10 p-4">
        <p className="mb-1 text-sm font-semibold text-burgundy-dark">Model ve Renk Varyantı</p>
        <p className="mb-3 text-xs text-charcoal/60">
          Aynı telefon modelinin farklı renkleri varsa, hepsini aynı modele bağlayın. Ürün sayfasında diğer
          renkler otomatik olarak gösterilir ve her rengin stoku ayrı takip edilir.
        </p>
        <div className="space-y-4">
          <FieldWrap label="Model" hint="Bu ürünün ait olduğu telefon modelini seçin veya yeni bir model oluşturun.">
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
            >
              <option value="">Modele bağlı değil (tekil ürün)</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <input
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onCreateModel();
                  }
                }}
                placeholder="Yeni model adı (Örn. Klasik Retro Telefon)"
                className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              />
              <Button type="button" variant="outline" size="sm" disabled={creatingModel} onClick={onCreateModel}>
                {creatingModel ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Oluştur
              </Button>
            </div>
            {modelError && <p className="mt-1 text-xs text-red-700">{modelError}</p>}
          </FieldWrap>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Renk Adı"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Örn. Pembe"
            />
            <FieldWrap label="Renk Kodu">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-burgundy/15 bg-ivory"
                />
                <input
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#b91c5c"
                  className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
            </FieldWrap>
          </div>
        </div>
      </div>

      <FieldWrap label="Ürün Videosu (opsiyonel)" hint="YouTube/Vimeo linki yapıştırın veya dosya yükleyin.">
        <div className="space-y-2">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          />
          <VideoUploader value={videoUrl} onUploaded={setVideoUrl} />
        </div>
      </FieldWrap>

      <div className="rounded-2xl border border-burgundy/10 p-4">
        <p className="mb-3 text-sm font-semibold text-burgundy-dark">SEO Ayarları (opsiyonel)</p>
        <div className="space-y-4">
          <Input
            label="Meta Başlık"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            hint="Boş bırakılırsa ürün adı kullanılır."
          />
          <Textarea
            label="Meta Açıklama"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            hint="Boş bırakılırsa kısa açıklama kullanılır."
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal/80">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-burgundy" />
        Sitede yayında (aktif)
      </label>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
        </Button>
      </div>
    </form>
  );
}
