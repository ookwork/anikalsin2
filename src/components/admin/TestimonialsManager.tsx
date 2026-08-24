"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Plus, Loader2, Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Testimonial } from "@/generated/prisma/client";

export default function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [authorLocation, setAuthorLocation] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAuthorName, setEditAuthorName] = useState("");
  const [editAuthorLocation, setEditAuthorLocation] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editSaving, setEditSaving] = useState(false);

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setEditAuthorName(t.authorName);
    setEditAuthorLocation(t.authorLocation ?? "");
    setEditContent(t.content);
    setEditRating(t.rating ?? 5);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setEditSaving(true);
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: editAuthorName,
        authorLocation: editAuthorLocation,
        content: editContent,
        rating: editRating,
      }),
    });
    setEditSaving(false);
    setEditingId(null);
    router.refresh();
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName, authorLocation, content, rating, order: testimonials.length }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eklenemedi.");
      return;
    }
    setAuthorName("");
    setAuthorLocation("");
    setContent("");
    setRating(5);
    router.refresh();
  };

  const onToggleActive = async (t: Testimonial) => {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {testimonials.length === 0 && <p className="text-charcoal/50">Henüz yorum eklenmemiş.</p>}
        {testimonials.map((t) =>
          editingId === t.id ? (
            <Card key={t.id} className="p-5">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Ad Soyad" value={editAuthorName} onChange={(e) => setEditAuthorName(e.target.value)} />
                  <Input label="Konum" value={editAuthorLocation} onChange={(e) => setEditAuthorLocation(e.target.value)} />
                </div>
                <Textarea label="Yorum" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                <div>
                  <p className="mb-1.5 text-sm font-medium text-burgundy-dark">Puan</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setEditRating(n)} className="cursor-pointer">
                        <Star
                          size={20}
                          className={n <= editRating ? "text-gold" : "text-charcoal/20"}
                          fill={n <= editRating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={editSaving} onClick={() => saveEdit(t.id)}>
                    {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Kaydet
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                    <X size={14} /> Vazgeç
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-burgundy-dark">{t.authorName}</p>
                  {t.authorLocation && <p className="text-xs text-charcoal/50">{t.authorLocation}</p>}
                  <p className="mt-2 text-sm text-charcoal/75">{t.content}</p>
                  <div className="mt-2 flex gap-0.5 text-gold">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    onClick={() => onToggleActive(t)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
                      t.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {t.isActive ? "Yayında" : "Pasif"}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(t)} className="rounded-lg p-1.5 text-burgundy hover:bg-rose-pale cursor-pointer">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(t.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-burgundy-dark">
          <Plus size={16} /> Yeni Yorum Ekle
        </h3>
        <form onSubmit={onAdd} className="mt-4 space-y-3">
          <Input label="Ad Soyad" required value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
          <Input label="Konum" value={authorLocation} onChange={(e) => setAuthorLocation(e.target.value)} />
          <Textarea label="Yorum" required value={content} onChange={(e) => setContent(e.target.value)} />
          <div>
            <p className="mb-1.5 text-sm font-medium text-burgundy-dark">Puan</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} className="cursor-pointer">
                  <Star size={20} className={n <= rating ? "text-gold" : "text-charcoal/20"} fill={n <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting} className="w-full">
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Ekle
          </Button>
        </form>
      </Card>
    </div>
  );
}
