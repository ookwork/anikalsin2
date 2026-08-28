"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AtSign, Mail, Phone } from "lucide-react";
import PaymentBadges from "@/components/payments/PaymentBadges";

interface FooterProps {
  phone: string;
  email: string;
  instagram: string;
  cities: string;
}

export default function Footer({ phone, email, instagram, cities }: FooterProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-burgundy/10 bg-burgundy-dark text-rose-pale">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-heading text-xl font-semibold text-on-brand">
              Anıkalsın<span className="text-gold"> Event</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-rose-pale/80">
              Düğün ve özel günlerinizin en samimi anlarını sesli anı telefonu, telefon kulübesi ve daha fazlasıyla
              ölümsüzleştiriyoruz. Türkiye geneli kargo, {cities} şehirlerinde saha ekibi.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-light">Hızlı Erişim</p>
            <ul className="mt-3 space-y-2 text-sm text-rose-pale/80">
              <li><Link href="/urunler" className="hover:text-on-brand">Ürünlerimiz</Link></li>
              <li><Link href="/nasil-calisir" className="hover:text-on-brand">Nasıl Çalışır</Link></li>
              <li><Link href="/blog" className="hover:text-on-brand">Blog</Link></li>
              <li><Link href="/sss" className="hover:text-on-brand">S.S.S.</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-on-brand">Hakkımızda</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-light">İletişim</p>
            <ul className="mt-3 space-y-2 text-sm text-rose-pale/80">
              <li className="flex items-center gap-2"><Phone size={15} /> {phone}</li>
              <li className="flex items-center gap-2"><Mail size={15} /> {email}</li>
              <li>
                <a
                  href={`https://instagram.com/${instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-on-brand/20 px-3 py-1.5 hover:border-on-brand/50 hover:text-on-brand"
                >
                  <AtSign size={15} /> {instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-on-brand/10 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-rose-pale/70">
            <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-on-brand">Mesafeli Kiralama Sözleşmesi</Link>
            <Link href="/on-bilgilendirme-formu" className="hover:text-on-brand">Ön Bilgilendirme Formu</Link>
            <Link href="/kvkk-aydinlatma-metni" className="hover:text-on-brand">KVKK Aydınlatma Metni</Link>
            <Link href="/kullanim-kosullari" className="hover:text-on-brand">Kullanım Koşulları</Link>
          </div>

          <PaymentBadges />

          <div className="flex flex-col items-center gap-2 text-center text-xs text-rose-pale/60 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Anıkalsın Event — Tüm hakları saklıdır.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
