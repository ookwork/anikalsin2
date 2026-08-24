"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu } from "lucide-react";

export default function AdminTopbar({ adminEmail }: { adminEmail?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b border-burgundy/10 bg-ivory px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Menu size={20} className="text-burgundy-dark" />
        <span className="font-heading text-lg font-semibold text-burgundy-dark">Admin</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {adminEmail && <span className="hidden text-sm text-charcoal/60 sm:inline">{adminEmail}</span>}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-burgundy/20 px-4 py-2 text-sm font-medium text-burgundy hover:bg-rose-pale disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={15} /> Çıkış Yap
        </button>
      </div>
    </header>
  );
}
