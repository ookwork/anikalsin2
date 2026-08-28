"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Loader2, Package, Users, Pencil, X, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { formatPrice } from "@/lib/format";
import type { AddOn } from "@/generated/prisma/client";

interface AddOnFormState {
  name: string;
  description: string;
  price: string;
  category: "ACCESSORY" | "STAFF_SERVICE";
  cityRestriction: string;
  imageUrl: string;
}

const emptyForm: AddOnFormState = {
  name: "",
  description: "",
  price: "",
  category: "ACCESSORY",
  cityRestriction: "",
  imageUrl: "",
};

function AddOnFields({
  form,
  setForm,
}: {
  form: AddOnFormState;
  setForm: (updater: (prev: AddOnFormState) => AddOnFormState) => void;
}) {
  return (
    <div className="space-y-3">
      <FieldWrap label="Görsel">
        <ImageUploader
          value={form.imageUrl}
          onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          onRemove={() => setForm((f) => ({ ...f, imageUrl: "" }))}
        />
      </FieldWrap>
      <FieldWrap label="Kategori">
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AddOnFormState["category"] }))}
          className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
        >
          <option value="ACCESSORY">Aksesuar</option>
          <option value="STAFF_SERVICE">Personel Hizmeti</option>
        </select>
      </FieldWrap>
      <Input label="İsim" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Textarea
        label="Açıklama"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <Input
        label="Fiyat (TL)"
        type="number"
        min={0}
        required
        value={form.price}
        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
      />
      {form.category === "STAFF_SERVICE" && (
        <Input
          label="Şehir Kısıtlaması"
          value={form.cityRestriction}
          onChange={(e) => setForm((f) => ({ ...f, cityRestriction: e.target.value }))}
          placeholder="İstanbul"
          hint="Boş bırakılırsa 'İstanbul' kullanılır."
        />
      )}
    </div>
  );
}

export default function AddOnsManager({ addOns }: { addOns: AddOn[] }) {
  const router = useRouter();
  const [form, setForm] = useState<AddOnFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddOnFormState>(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/addons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        cityRestriction: form.category === "STAFF_SERVICE" ? form.cityRestriction || "İstanbul" : "",
        imageUrl: form.imageUrl,
        order: addOns.length,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eklenemedi.");
      return;
    }
    setForm(emptyForm);
    router.refresh();
  };

  const startEdit = (a: AddOn) => {
    setEditingId(a.id);
    setEditError(null);
    setEditForm({
      name: a.name,
      description: a.description ?? "",
      price: String(a.price),
      category: a.category,
      cityRestriction: a.cityRestriction ?? "",
      imageUrl: a.imageUrl ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async (id: string) => {
    setEditSubmitting(true);
    setEditError(null);
    const res = await fetch(`/api/admin/addons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        category: editForm.category,
        cityRestriction: editForm.category === "STAFF_SERVICE" ? editForm.cityRestriction || "İstanbul" : "",
        imageUrl: editForm.imageUrl,
      }),
    });
    setEditSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error ?? "Kaydedilemedi.");
      return;
    }
    setEditingId(null);
    router.refresh();
  };

  const onToggleActive = async (a: AddOn) => {
    await fetch(`/api/admin/addons/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    setDeleteError(null);
    const res = await fetch(`/api/admin/addons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Ek hizmet silinemedi.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {deleteError && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{deleteError}</p>
        )}
        {addOns.length === 0 && <p className="text-charcoal/50">Henüz ek hizmet eklenmemiş.</p>}
        {addOns.map((a) =>
          editingId === a.id ? (
            <Card key={a.id} className="p-5">
              <AddOnFields form={editForm} setForm={setEditForm} />
              {editError && <p className="mt-2 text-xs text-red-700">{editError}</p>}
              <div className="mt-3 flex items-center gap-2">
                <Button type="button" size="sm" disabled={editSubmitting} onClick={() => saveEdit(a.id)}>
                  {editSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Kaydet
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                  <X size={14} /> İptal
                </Button>
              </div>
            </Card>
          ) : (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-rose-pale">
                    {a.imageUrl && <Image src={a.imageUrl} alt={a.name} fill className="object-cover" sizes="56px" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {a.category === "ACCESSORY" ? (
                        <Package size={15} className="text-burgundy" />
                      ) : (
                        <Users size={15} className="text-burgundy" />
                      )}
                      <p className="font-semibold text-burgundy-dark">{a.name}</p>
                    </div>
                    {a.description && <p className="mt-1 text-sm text-charcoal/70">{a.description}</p>}
                    {a.cityRestriction && (
                      <p className="mt-1 text-xs font-medium text-gold">Sadece {a.cityRestriction}</p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-burgundy">{formatPrice(a.price)}</p>
                  </div>
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(a)}
                      className="rounded-lg p-1.5 text-burgundy hover:bg-rose-pale cursor-pointer"
                      title="Düzenle"
                    >
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(a.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer" title="Sil">
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
          <Plus size={16} /> Yeni Ek Hizmet Ekle
        </h3>
        <form onSubmit={onAdd} className="mt-4 space-y-3">
          <AddOnFields form={form} setForm={setForm} />
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
