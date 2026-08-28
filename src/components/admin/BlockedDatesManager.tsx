"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import { tr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { CalendarOff, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateRange } from "@/lib/format";

interface BlockedDateRow {
  id: string;
  date: string;
  productId: string | null;
  productName: string | null;
  reason: string | null;
}

interface Group {
  key: string;
  ids: string[];
  from: string;
  to: string;
  productName: string | null;
  reason: string | null;
}

function groupRows(rows: BlockedDateRow[]): Group[] {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const groups: Group[] = [];
  for (const row of sorted) {
    const last = groups[groups.length - 1];
    const rowDay = new Date(row.date).getTime();
    const lastDay = last ? new Date(last.to).getTime() : NaN;
    const isConsecutive = last && rowDay - lastDay === 24 * 60 * 60 * 1000;
    const sameGroup = last && last.productName === row.productName && last.reason === row.reason && isConsecutive;
    if (sameGroup) {
      last.to = row.date;
      last.ids.push(row.id);
    } else {
      groups.push({
        key: row.id,
        ids: [row.id],
        from: row.date,
        to: row.date,
        productName: row.productName,
        reason: row.reason,
      });
    }
  }
  return groups;
}

export default function BlockedDatesManager({
  products,
  blockedDates,
}: {
  products: { id: string; name: string }[];
  blockedDates: BlockedDateRow[];
}) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const [productId, setProductId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const groups = groupRows(blockedDates);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from) {
      setError("Lütfen kapatmak istediğiniz tarih (veya aralığı) seçin.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: range.from.toISOString(),
        endDate: (range.to ?? range.from).toISOString(),
        productId: productId || null,
        reason,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kapatılamadı.");
      return;
    }
    setRange(undefined);
    setReason("");
    router.refresh();
  };

  const onDeleteGroup = async (group: Group) => {
    setDeletingKey(group.key);
    await Promise.all(group.ids.map((id) => fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" })));
    setDeletingKey(null);
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {groups.length === 0 && <p className="text-charcoal/50">Manuel olarak kapatılmış bir tarih yok.</p>}
        {groups.map((g) => (
          <Card key={g.key} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-medium text-burgundy-dark">
                  <CalendarOff size={15} className="text-burgundy" />
                  {g.from === g.to ? formatDate(g.from) : formatDateRange(g.from, g.to)}
                </p>
                <p className="mt-1 text-xs text-charcoal/60">{g.productName ?? "Tüm Ürünler"}</p>
                {g.reason && <p className="mt-1 text-xs text-charcoal/50">{g.reason}</p>}
              </div>
              <button
                onClick={() => onDeleteGroup(g)}
                disabled={deletingKey === g.key}
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                title="Kapalı tarihi kaldır"
              >
                {deletingKey === g.key ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-burgundy-dark">
          <CalendarOff size={16} /> Tarih Kapat
        </h3>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <FieldWrap label="Kapatılacak Tarih(ler)">
            <div className="rounded-xl border border-burgundy/15 bg-ivory p-2">
              <DayPicker mode="range" locale={tr} selected={range} onSelect={setRange} className="mx-auto" />
            </div>
          </FieldWrap>
          <FieldWrap label="Ürün">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
            >
              <option value="">Tüm Ürünler</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FieldWrap>
          <Input
            label="Sebep (opsiyonel)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Örn. bakım, tatil"
          />
          {error && <p className="text-xs text-red-700">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting} className="w-full">
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Kapat
          </Button>
        </form>
      </Card>
    </div>
  );
}
