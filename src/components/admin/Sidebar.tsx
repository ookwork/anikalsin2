"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  FileText,
  MessageSquareQuote,
  HelpCircle,
  Sparkles,
  Newspaper,
  ExternalLink,
  Frame as FrameIcon,
  Tag,
  Landmark,
  Music,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/stats", label: "İstatistikler", icon: BarChart3 },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/reservations", label: "Rezervasyonlar", icon: CalendarDays },
  { href: "/admin/revenue", label: "Kazanç", icon: Landmark },
  { href: "/admin/frames", label: "Çerçeveler", icon: FrameIcon },
  { href: "/admin/addons", label: "Ek Hizmetler", icon: Sparkles },
  { href: "/admin/discount-codes", label: "İndirim Kodları", icon: Tag },
  { href: "/admin/audio-samples", label: "Ses Örnekleri", icon: Music },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/content", label: "Site İçeriği", icon: FileText },
  { href: "/admin/testimonials", label: "Yorumlar", icon: MessageSquareQuote },
  { href: "/admin/faq", label: "S.S.S.", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-burgundy/10 bg-ivory px-4 py-6 md:flex">
      <Link href="/admin/dashboard" className="mb-8 px-2 font-heading text-xl font-semibold text-burgundy-dark">
        Anıkalsın<span className="text-gold">.</span> <span className="text-xs font-sans font-normal text-charcoal/40">Admin</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-burgundy text-ivory" : "text-charcoal/70 hover:bg-rose-pale hover:text-burgundy"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        target="_blank"
        className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal/50 hover:bg-cream"
      >
        <ExternalLink size={16} /> Siteyi Görüntüle
      </Link>
    </aside>
  );
}
