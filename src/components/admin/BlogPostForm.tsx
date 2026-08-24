"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/format";
import type { BlogPost } from "@/generated/prisma/client";

export default function BlogPostForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = { title, slug, excerpt, content, coverImage, isPublished, metaTitle, metaDescription };

    const res = await fetch(isEdit ? `/api/admin/blog/${initial!.id}` : "/api/admin/blog", {
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

    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-burgundy-dark">Kapak Görseli</p>
        <ImageUploader value={coverImage} onUploaded={setCoverImage} onRemove={() => setCoverImage("")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Başlık"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
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
          hint="URL'de görünür: /blog/slug"
        />
      </div>

      <Textarea label="Özet" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} hint="Liste kartlarında görünür." />

      <RichTextEditor label="İçerik" value={content} onChange={setContent} />

      <div className="rounded-2xl border border-burgundy/10 p-4">
        <p className="mb-3 text-sm font-semibold text-burgundy-dark">SEO Ayarları (opsiyonel)</p>
        <div className="space-y-4">
          <Input label="Meta Başlık" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          <Textarea label="Meta Açıklama" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal/80">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 accent-burgundy"
        />
        Yayınla
      </label>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? "Değişiklikleri Kaydet" : "Yazıyı Oluştur"}
      </Button>
    </form>
  );
}
