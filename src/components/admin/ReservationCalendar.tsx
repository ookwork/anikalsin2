"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { tr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatDateRange } from "@/lib/format";

interface ReservationItem {
  id: string;
  customerName: string;
  status: string;
  eventDate: string | null;
  rentalStart: string;
  rentalEnd: string;
}

export default function ReservationCalendar({
  products,
}: {
  products: { id: string; name: string }[];
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/admin/reservations?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => setReservations(data.reservations ?? []))
      .finally(() => setLoading(false));
  }, [productId]);

  const inRange = (day: Date, r: ReservationItem) => {
    const start = new Date(r.rentalStart);
    const end = new Date(r.rentalEnd);
    return day >= new Date(start.toDateString()) && day < end;
  };

  const isConfirmedDay = (day: Date) => reservations.some((r) => r.status === "CONFIRMED" && inRange(day, r));
  const isPendingDay = (day: Date) => reservations.some((r) => r.status === "PENDING" && inRange(day, r));

  const dayReservations = selectedDay
    ? reservations.filter((r) => inRange(selectedDay, r) && ["PENDING", "CONFIRMED"].includes(r.status))
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mb-4 w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="rounded-2xl border border-burgundy/15 bg-ivory p-4">
          {loading && <p className="mb-2 text-xs text-charcoal/50">Yükleniyor...</p>}
          <DayPicker
            mode="single"
            locale={tr}
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={{ confirmed: isConfirmedDay, pending: isPendingDay }}
            modifiersClassNames={{
              confirmed: "rdp-confirmed",
              pending: "rdp-pending",
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-burgundy/10 pt-3 text-xs text-charcoal/60">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Onaylı</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400" /> Beklemede</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-burgundy-dark">
          {selectedDay ? formatDate(selectedDay) : "Bir tarih seçin"}
        </h3>
        <div className="mt-3 space-y-3">
          {selectedDay && dayReservations.length === 0 && (
            <p className="text-sm text-charcoal/50">Bu tarihte rezervasyon yok.</p>
          )}
          {dayReservations.map((r) => (
            <div key={r.id} className="rounded-2xl border border-burgundy/10 bg-ivory p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-burgundy-dark">{r.customerName}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 text-xs text-charcoal/60">
                Etkinlik: {formatDate(r.eventDate ?? r.rentalStart)}
                {r.status === "CONFIRMED" && (
                  <span className="text-charcoal/40">
                    {" "}
                    · Kapalı aralık: {formatDateRange(r.rentalStart, new Date(new Date(r.rentalEnd).getTime() - 1))}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .rdp-confirmed { background-color: rgba(16,185,129,0.18); border-radius: 9999px; }
        .rdp-pending { background-color: rgba(251,191,36,0.25); border-radius: 9999px; }
      `}</style>
    </div>
  );
}
