"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Package, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { AddOn } from "@/generated/prisma/client";

export default function AddOnsManager({ addOns }: { addOns: AddOn[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"ACCESSORY" | "STAFF_SERVICE">("ACCESSORY");
  const [cityRestriction, setCityRestriction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/addons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: Number(price),
        category,
        cityRestriction: category === "STAFF_SERVICE" ? cityRestriction || "İstanbul" : "",
        order: addOns.length,
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
    setPrice("");
    setCityRestriction("");
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
        {addOns.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
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
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  onClick={() => onToggleActive(a)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
                    a.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {a.isActive ? "Yayında" : "Pasif"}
                </button>
                <button onClick={() => onDelete(a.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-burgundy-dark">
          <Plus size={16} /> Yeni Ek Hizmet Ekle
        </h3>
        <form onSubmit={onAdd} className="mt-4 space-y-3">
          <FieldWrap label="Kategori">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "ACCESSORY" | "STAFF_SERVICE")}
              className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
            >
              <option value="ACCESSORY">Aksesuar</option>
              <option value="STAFF_SERVICE">Personel Hizmeti</option>
            </select>
          </FieldWrap>
          <Input label="İsim" required value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Fiyat (TL)" type="number" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} />
          {category === "STAFF_SERVICE" && (
            <Input
              label="Şehir Kısıtlaması"
              value={cityRestriction}
              onChange={(e) => setCityRestriction(e.target.value)}
              placeholder="İstanbul"
              hint="Boş bırakılırsa 'İstanbul' kullanılır."
            />
          )}
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
