"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Pencil, Check, X, Music } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AudioUploader from "@/components/admin/AudioUploader";
import type { AudioSample } from "@/generated/prisma/client";

export default function AudioSamplesManager({ audioSamples }: { audioSamples: AudioSample[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/audio-samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, audioUrl, order: audioSamples.length }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eklenemedi.");
      return;
    }
    setTitle("");
    setDescription("");
    setAudioUrl("");
    router.refresh();
  };

  const onToggleActive = async (a: AudioSample) => {
    await fetch(`/api/admin/audio-samples/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/admin/audio-samples/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const startEdit = (a: AudioSample) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditDescription(a.description ?? "");
    setEditAudioUrl(a.audioUrl);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setEditSaving(true);
    await fetch(`/api/admin/audio-samples/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription, audioUrl: editAudioUrl }),
    });
    setEditSaving(false);
    setEditingId(null);
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {audioSamples.length === 0 && <p className="text-charcoal/50">Henüz ses örneği eklenmemiş.</p>}
        {audioSamples.map((a) =>
          editingId === a.id ? (
            <Card key={a.id} className="p-5">
              <div className="space-y-3">
                <Input label="Başlık" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <Textarea label="Açıklama" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                <FieldWrap label="Ses Dosyası">
                  <AudioUploader value={editAudioUrl} onUploaded={setEditAudioUrl} />
                </FieldWrap>
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={editSaving} onClick={() => saveEdit(a.id)}>
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
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Music size={15} className="text-burgundy" />
                    <p className="font-semibold text-burgundy-dark">{a.title}</p>
                  </div>
                  {a.description && <p className="mt-1 text-sm text-charcoal/70">{a.description}</p>}
                  <audio controls src={a.audioUrl} className="mt-2 h-9 w-full max-w-sm" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    onClick={() => onToggleActive(a)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
                      a.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {a.isActive ? "Yayında" : "Pasif"}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(a)} className="rounded-lg p-1.5 text-burgundy hover:bg-rose-pale cursor-pointer">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(a.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
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
          <Plus size={16} /> Yeni Ses Örneği Ekle
        </h3>
        <form onSubmit={onAdd} className="mt-4 space-y-3">
          <Input label="Başlık" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <FieldWrap label="Ses Dosyası">
            <AudioUploader value={audioUrl} onUploaded={setAudioUrl} />
          </FieldWrap>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting || !audioUrl} className="w-full">
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Ekle
          </Button>
        </form>
      </Card>
    </div>
  );
}
