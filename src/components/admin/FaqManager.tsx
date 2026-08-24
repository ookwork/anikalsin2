"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Faq } from "@/generated/prisma/client";

export default function FaqManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const startEdit = (f: Faq) => {
    setEditingId(f.id);
    setEditQuestion(f.question);
    setEditAnswer(f.answer);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setEditSaving(true);
    await fetch(`/api/admin/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: editQuestion, answer: editAnswer }),
    });
    setEditSaving(false);
    setEditingId(null);
    router.refresh();
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, order: faqs.length }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eklenemedi.");
      return;
    }
    setQuestion("");
    setAnswer("");
    router.refresh();
  };

  const onToggleActive = async (f: Faq) => {
    await fetch(`/api/admin/faq/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !f.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {faqs.length === 0 && <p className="text-charcoal/50">Henüz soru eklenmemiş.</p>}
        {faqs.map((f) =>
          editingId === f.id ? (
            <Card key={f.id} className="p-5">
              <div className="space-y-3">
                <Input label="Soru" value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} />
                <Textarea label="Cevap" value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} />
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={editSaving} onClick={() => saveEdit(f.id)}>
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
            <Card key={f.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-burgundy-dark">{f.question}</p>
                  <p className="mt-1.5 text-sm text-charcoal/75">{f.answer}</p>
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
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(f)} className="rounded-lg p-1.5 text-burgundy hover:bg-rose-pale cursor-pointer">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(f.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
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
          <Plus size={16} /> Yeni Soru Ekle
        </h3>
        <form onSubmit={onAdd} className="mt-4 space-y-3">
          <Input label="Soru" required value={question} onChange={(e) => setQuestion(e.target.value)} />
          <Textarea label="Cevap" required value={answer} onChange={(e) => setAnswer(e.target.value)} />
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
