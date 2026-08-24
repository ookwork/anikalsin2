"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function ReservationSearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`/admin/reservations?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full sm:w-72">
      <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Telefon veya referans kodu ara..."
        className="w-full rounded-xl border border-burgundy/15 bg-ivory py-2.5 pl-9 pr-3 text-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
      />
    </form>
  );
}
