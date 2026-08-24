import type { Metadata } from "next";
import { Phone, Mail, AtSign, MapPin } from "lucide-react";
import { getContent } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Sorularınız için bize ulaşın.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [phone, email, instagram, address, cities] = await Promise.all([
    getContent("contact.phone", "0850 000 00 00"),
    getContent("contact.email", "info@anikalsin.com.tr"),
    getContent("contact.instagram", "@anikalsin"),
    getContent("contact.address", ""),
    getContent("contact.cities", "Türkiye'nin tamamı"),
  ]);

  const items = [
    { icon: Phone, label: "Telefon", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "E-posta", value: email, href: `mailto:${email}` },
    { icon: AtSign, label: "Instagram", value: instagram, href: `https://instagram.com/${instagram.replace("@", "")}` },
    ...(address ? [{ icon: MapPin, label: "Adres", value: address, href: undefined }] : []),
    { icon: MapPin, label: "Saha Ekibi Hizmet Bölgesi", value: cities, href: undefined },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">Bize Ulaşın</p>
      <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">İletişim</h1>
      <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">
        Sorularınız veya özel talepleriniz için aşağıdaki kanallardan bize ulaşabilir, ya da doğrudan rezervasyon
        sayfasından talebinizi iletebilirsiniz.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-burgundy/10 bg-ivory p-5 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-pale text-burgundy">
              <item.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-charcoal/50">{item.label}</p>
              {item.href ? (
                <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-sm font-medium text-burgundy-dark hover:underline">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-medium text-burgundy-dark">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <ButtonLink href="/urunler" size="lg">Rezervasyon Yap</ButtonLink>
      </div>
    </div>
  );
}
