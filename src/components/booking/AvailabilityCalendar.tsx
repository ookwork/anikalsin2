"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { tr } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface BookedRange {
  from: string;
  to: string;
}

interface AvailabilityCalendarProps {
  productId: string;
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export default function AvailabilityCalendar({ productId, selected, onSelect }: AvailabilityCalendarProps) {
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/availability?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => setBookedRanges(data.bookedRanges ?? []))
      .catch(() => setBookedRanges([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabled = [
    { before: today },
    // r.to sunucuda "hariç" (exclusive) uç olarak tutuluyor; DayPicker {from,to} aralığını iki ucu da
    // dahil (inclusive) yorumladığından, bir sonraki günü yanlışlıkla dolu göstermemek için 1ms geri alınır.
    ...bookedRanges.map((r) => ({ from: new Date(r.from), to: new Date(new Date(r.to).getTime() - 1) })),
  ];

  return (
    <div className="rounded-2xl border border-burgundy/15 bg-ivory p-4">
      {loading && <p className="mb-2 text-xs text-charcoal/50">Müsaitlik bilgisi yükleniyor...</p>}
      <DayPicker
        mode="single"
        locale={tr}
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        numberOfMonths={1}
        className="mx-auto"
      />
      <div className="mt-3 flex items-center gap-4 border-t border-burgundy/10 pt-3 text-xs text-charcoal/60">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-burgundy" /> Seçili tarih
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-charcoal/20 line-through" /> Dolu / geçmiş / kapalı tarih
        </span>
      </div>
    </div>
  );
}
