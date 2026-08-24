"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/urunler", key: "nav.urunler", label: "Ürünlerimiz" },
  { href: "/nasil-calisir", key: "nav.nasilCalisir", label: "Nasıl Çalışır" },
  { href: "/ornek-dinle", key: "nav.ornekDinle", label: "Örnek Dinle" },
  { href: "/blog", key: "nav.blog", label: "Blog" },
  { href: "/sss", key: "nav.sss", label: "S.S.S." },
  { href: "/hakkimizda", key: "nav.hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", key: "nav.iletisim", label: "İletişim" },
];

interface HeaderProps {
  labels?: Record<string, string>;
}

export default function Header({ labels = {} }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ctaLabel = labels["nav.cta"] || "Rezervasyon Yap";

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-burgundy/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-burgundy-dark">
          Anıkalsın<span className="text-gold"> Event</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal/80 transition-colors hover:text-burgundy"
            >
              {labels[link.key] || link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="/urunler" size="sm">
            <PhoneCall size={16} />
            {ctaLabel}
          </ButtonLink>
        </div>

        <button
          className="rounded-full p-2 text-burgundy-dark md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-burgundy/10 bg-cream px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-charcoal/80 hover:bg-rose-pale hover:text-burgundy"
              >
                {labels[link.key] || link.label}
              </Link>
            ))}
            <ButtonLink href="/urunler" size="sm" className="mt-2 justify-center">
              {ctaLabel}
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
