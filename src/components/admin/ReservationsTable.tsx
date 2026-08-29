"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Wallet, Send, Copy, Check, Truck, Headphones } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { formatDate, formatPrice } from "@/lib/format";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

function formatDateInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function ShippingEditor({
  reservation,
  onSaved,
}: {
  reservation: ReservationWithProduct;
  onSaved: () => void;
}) {
  const [carrier, setCarrier] = useState(reservation.shippingCarrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(reservation.shippingTrackingNumber ?? "");
  const [date, setDate] = useState(formatDateInput(reservation.shippingDate));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/reservations/${reservation.id}/shipping`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingCarrier: carrier,
        shippingTrackingNumber: trackingNumber,
        shippingDate: date ? new Date(date).toISOString() : "",
      }),
    });
    setSaving(false);
    setSaved(true);
    onSaved();
  };

  return (
    <div className="mt-3 rounded-xl border border-burgundy/10 bg-ivory p-3 sm:col-span-2">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/50">
        <Truck size={13} /> Kargo Takibi
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          placeholder="Kargo Firması"
          className="rounded-lg border border-burgundy/15 bg-ivory px-3 py-1.5 text-xs focus:border-burgundy focus:outline-none"
        />
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Takip Numarası"
          className="rounded-lg border border-burgundy/15 bg-ivory px-3 py-1.5 text-xs focus:border-burgundy focus:outline-none"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-burgundy/15 bg-ivory px-3 py-1.5 text-xs focus:border-burgundy focus:outline-none"
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-burgundy px-3 py-1.5 text-xs font-medium text-ivory hover:bg-burgundy-dark cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          Kaydet
        </button>
        {saved && !saving && <span className="text-xs text-emerald-700">Kaydedildi.</span>}
      </div>
    </div>
  );
}

function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(`${window.location.origin}${path}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex shrink-0 items-center gap-1 rounded-full border border-burgundy/20 px-2.5 py-1 text-xs font-medium text-burgundy hover:bg-rose-pale cursor-pointer"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

type ReservationWithProduct = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  eventCity: string | null;
  deliveryAddress: string | null;
  note: string | null;
  eventDate: Date | null;
  rentalStart: Date;
  rentalEnd: Date;
  status: string;
  shippingCarrier?: string | null;
  shippingTrackingNumber?: string | null;
  shippingDate?: Date | null;
  product: { name: string; price?: number };
  payment?: { id: string; referenceCode: string; status: string; amount: number } | null;
  frame?: { name: string } | null;
};

const FILTERS = [
  { value: "ALL", label: "Tümü" },
  { value: "PENDING", label: "Beklemede" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "REJECTED", label: "Reddedildi" },
  { value: "CANCELLED", label: "İptal" },
  { value: "EXPIRED", label: "Süresi Doldu" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Beklemede" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "REJECTED", label: "Reddedildi" },
  { value: "CANCELLED", label: "İptal" },
  { value: "EXPIRED", label: "Süresi Doldu" },
];

export default function ReservationsTable({
  reservations,
  initialFilter = "ALL",
}: {
  reservations: ReservationWithProduct[];
  initialFilter?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReservationWithProduct | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "ALL" ? reservations : reservations.filter((r) => r.status === filter)),
    [reservations, filter]
  );

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id);
    setActionError(null);
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error ?? "İşlem başarısız.");
      return;
    }
    router.refresh();
  };

  const sendPaymentInfo = async (id: string) => {
    setLoadingId(id);
    setActionError(null);
    const res = await fetch(`/api/admin/reservations/${id}/send-payment`, { method: "POST" });
    setLoadingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error ?? "Ödeme bilgisi oluşturulamadı.");
      return;
    }
    setExpanded(id);
    router.refresh();
  };

  const markPaid = async (paymentId: string) => {
    setLoadingId(paymentId);
    setActionError(null);
    const res = await fetch(`/api/admin/payments/${paymentId}/mark-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "EFT_HAVALE" }),
    });
    setLoadingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error ?? "Ödeme işaretlenemedi.");
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoadingId(deleteTarget.id);
    await fetch(`/api/admin/reservations/${deleteTarget.id}`, { method: "DELETE" });
    setLoadingId(null);
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              filter === f.value ? "bg-burgundy text-ivory" : "bg-ivory text-charcoal/60 hover:bg-rose-pale"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-burgundy/10 text-xs uppercase tracking-wide text-charcoal/50">
              <th className="px-5 py-3">Müşteri</th>
              <th className="px-5 py-3">Ürün</th>
              <th className="px-5 py-3">Etkinlik Tarihi</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3">Ödeme</th>
              <th className="px-5 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-charcoal/50">
                  Bu filtrede rezervasyon bulunmuyor.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <Fragment key={r.id}>
                <tr
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="cursor-pointer border-b border-burgundy/5 last:border-0 hover:bg-cream/60"
                >
                  <td className="px-5 py-3 font-medium text-burgundy-dark">{r.customerName}</td>
                  <td className="px-5 py-3 text-charcoal/70">{r.product.name}</td>
                  <td className="px-5 py-3 text-charcoal/70">{formatDate(r.eventDate ?? r.rentalStart)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    {r.payment ? <PaymentStatusBadge status={r.payment.status} /> : <span className="text-xs text-charcoal/40">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {loadingId === r.id || loadingId === r.payment?.id ? (
                        <Loader2 size={16} className="animate-spin text-burgundy" />
                      ) : (
                        <>
                          {r.status === "CONFIRMED" && !r.payment && (
                            <button
                              onClick={() => sendPaymentInfo(r.id)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-burgundy hover:bg-rose-pale cursor-pointer"
                              title="Ödeme Bilgilerini İlet"
                            >
                              <Send size={14} /> Ödeme Bilgilerini İlet
                            </button>
                          )}
                          {r.payment && r.payment.status === "PENDING" && (
                            <button
                              onClick={() => markPaid(r.payment!.id)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              title="Ödemeyi Alındı Olarak İşaretle"
                            >
                              <Wallet size={14} /> Ödemeyi Al
                            </button>
                          )}
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                            className="rounded-lg border border-burgundy/15 bg-ivory px-2 py-1.5 text-xs focus:border-burgundy focus:outline-none cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="rounded-lg p-2 text-charcoal/50 hover:bg-cream cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr className="border-b border-burgundy/5 bg-cream/40">
                    <td colSpan={6} className="px-5 py-4 text-sm text-charcoal/70">
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        <p><strong>Telefon:</strong> {r.customerPhone}</p>
                        {r.customerEmail && <p><strong>E-posta:</strong> {r.customerEmail}</p>}
                        {r.eventCity && <p><strong>Şehir:</strong> {r.eventCity}</p>}
                        {r.frame && <p><strong>Çerçeve:</strong> {r.frame.name}</p>}
                        {r.payment && (
                          <>
                            <p><strong>Referans Kodu:</strong> {r.payment.referenceCode}</p>
                            <p><strong>Tutar:</strong> {formatPrice(r.payment.amount)}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                              <strong>Ödeme Linki:</strong>
                              <span className="truncate text-burgundy-dark">/odeme/{r.payment.referenceCode}</span>
                              <CopyLinkButton path={`/odeme/${r.payment.referenceCode}`} />
                            </div>
                          </>
                        )}
                        {r.deliveryAddress && <p className="sm:col-span-2"><strong>Adres:</strong> {r.deliveryAddress}</p>}
                        {r.note && <p className="sm:col-span-2"><strong>Not:</strong> {r.note}</p>}
                        <p className="sm:col-span-2">
                          <Link
                            href={`/admin/voice-deliveries?reservationId=${r.id}`}
                            className="inline-flex items-center gap-1.5 font-medium text-burgundy hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Headphones size={14} /> Sesleri Gönder
                          </Link>
                        </p>
                        <ShippingEditor reservation={r} onSaved={() => router.refresh()} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Rezervasyonu Sil"
        description={`"${deleteTarget?.customerName}" adlı müşterinin rezervasyonunu kalıcı olarak silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        loading={loadingId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
