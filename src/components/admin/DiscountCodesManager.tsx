"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Plus, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { DiscountCode, DiscountType } from "@/generated/prisma/client";

type DiscountCodeWithCount = DiscountCode & { _count: { reservations: number } };

export default function DiscountCodesManager({ discountCodes }: { discountCodes: DiscountCodeWithCount[] }) {
  const router = useRouter();
  const [type, setType] = useState<DiscountType>("PERCENTAGE");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value: Number(value) }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kod üretilemedi.");
      return;
    }
    setValue("");
    router.refresh();
  };

  const onToggleActive = async (d: DiscountCode) => {
    await fetch(`/api/admin/discount-codes/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !d.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/admin/discount-codes/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const copyCode = (d: DiscountCode) => {
    navigator.clipboard.writeText(d.code);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId((id) => (id === d.id ? null : id)), 1500);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {discountCodes.length === 0 && <p className="text-charcoal/50">Henüz indirim kodu üretilmemiş.</p>}
        {discountCodes.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-rose-pale px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-burgundy-dark">
                    {d.code}
                  </span>
                  <button
                    onClick={() => copyCode(d)}
                    className="rounded-lg p-1.5 text-burgundy/60 hover:bg-rose-pale hover:text-burgundy cursor-pointer"
                    title="Kodu kopyala"
                  >
                    {copiedId === d.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="mt-1 text-sm text-charcoal/70">
                  {d.type === "PERCENTAGE" ? `%${d.value} indirim` : `${formatPrice(d.value)} indirim`}
                  {d._count.reservations > 0 && ` · ${d._count.reservations} rezervasyonda kullanıldı`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => onToggleActive(d)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
                    d.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {d.isActive ? "Aktif" : "Pasif"}
                </button>
                <button onClick={() => onDelete(d.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-burgundy-dark">
          <Plus size={16} /> Yeni İndirim Kodu Üret
        </h3>
        <form onSubmit={onCreate} className="mt-4 space-y-3">
          <FieldWrap label="İndirim Türü">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DiscountType)}
              className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
            >
              <option value="PERCENTAGE">Yüzde (%)</option>
              <option value="FIXED_AMOUNT">Doğrudan Fiyat (TL)</option>
            </select>
          </FieldWrap>
          <Input
            label={type === "PERCENTAGE" ? "İndirim Oranı (%)" : "İndirim Tutarı (TL)"}
            type="number"
            min={1}
            max={type === "PERCENTAGE" ? 100 : undefined}
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {error && <p className="text-xs text-red-700">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting} className="w-full">
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Kod Üret
          </Button>
        </form>
      </Card>
    </div>
  );
}
