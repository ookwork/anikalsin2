"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";

interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
  image?: boolean;
  theme?: boolean;
}

interface ContentGroup {
  title: string;
  fields: FieldDef[];
}

const THEME_OPTIONS = [
  { value: "classic", label: "Klasik", hint: "Zarif düğün teması (mevcut)", swatches: ["#faf3ea", "#5c2a3a", "#c6a15b"] },
  { value: "modern", label: "Modern", hint: "Sade, minimal, koyu antrasit + turkuaz", swatches: ["#f5f6f7", "#20242b", "#0e9488"] },
  { value: "pastel", label: "Pastel Romantik", hint: "Yumuşak pudra tonları", swatches: ["#fdf5f7", "#8c5a72", "#d4a373"] },
  { value: "dark", label: "Koyu Zarif", hint: "Lüks, gece teması", swatches: ["#181215", "#8c2f45", "#e8c873"] },
];

const GROUPS: ContentGroup[] = [
  {
    title: "Görünüm",
    fields: [{ key: "site.theme", label: "Site Teması", theme: true }],
  },
  {
    title: "Anasayfa - Hero",
    fields: [
      { key: "home.hero.title", label: "Başlık" },
      { key: "home.hero.subtitle", label: "Alt Başlık", multiline: true },
      { key: "home.hero.cta", label: "Buton Metni" },
      { key: "home.hero.image", label: "Hero Görseli", image: true },
    ],
  },
  {
    title: "Anasayfa - İstatistikler",
    fields: [
      { key: "home.stats.weddings", label: "Rakam 1 (örn. 850+)" },
      { key: "home.stats.weddings_label", label: "Rakam 1 Etiketi" },
      { key: "home.stats.messages", label: "Rakam 2" },
      { key: "home.stats.messages_label", label: "Rakam 2 Etiketi" },
      { key: "home.stats.cities", label: "Rakam 3" },
      { key: "home.stats.cities_label", label: "Rakam 3 Etiketi" },
    ],
  },
  {
    title: "Anasayfa - Galeri",
    fields: [
      { key: "home.gallery.image1", label: "Galeri Görseli 1", image: true },
      { key: "home.gallery.image2", label: "Galeri Görseli 2", image: true },
      { key: "home.gallery.image3", label: "Galeri Görseli 3", image: true },
      { key: "home.gallery.image4", label: "Galeri Görseli 4", image: true },
      { key: "home.gallery.image5", label: "Galeri Görseli 5", image: true },
      { key: "home.gallery.image6", label: "Galeri Görseli 6", image: true },
    ],
  },
  {
    title: "Üst Menü",
    fields: [
      { key: "nav.urunler", label: "Menü: Ürünlerimiz" },
      { key: "nav.nasilCalisir", label: "Menü: Nasıl Çalışır" },
      { key: "nav.ornekDinle", label: "Menü: Örnek Dinle" },
      { key: "nav.blog", label: "Menü: Blog" },
      { key: "nav.sss", label: "Menü: S.S.S." },
      { key: "nav.hakkimizda", label: "Menü: Hakkımızda" },
      { key: "nav.iletisim", label: "Menü: İletişim" },
      { key: "nav.cta", label: "Rezervasyon Butonu Metni" },
    ],
  },
  {
    title: "Hakkımızda",
    fields: [
      { key: "about.title", label: "Başlık" },
      { key: "about.body", label: "Metin", multiline: true },
      { key: "about.metaTitle", label: "SEO Başlığı" },
      { key: "about.metaDescription", label: "SEO Açıklaması", multiline: true },
    ],
  },
  {
    title: "Nasıl Çalışır",
    fields: [
      { key: "howitworks.intro", label: "Giriş Metni", multiline: true },
      { key: "howitworks.step1.title", label: "1. Adım Başlığı" },
      { key: "howitworks.step1.description", label: "1. Adım Metni", multiline: true },
      { key: "howitworks.step2.title", label: "2. Adım Başlığı" },
      { key: "howitworks.step2.description", label: "2. Adım Metni", multiline: true },
      { key: "howitworks.step3.title", label: "3. Adım Başlığı" },
      { key: "howitworks.step3.description", label: "3. Adım Metni", multiline: true },
      { key: "howitworks.step4.title", label: "4. Adım Başlığı" },
      { key: "howitworks.step4.description", label: "4. Adım Metni", multiline: true },
      { key: "howitworks.step5.title", label: "5. Adım Başlığı" },
      { key: "howitworks.step5.description", label: "5. Adım Metni", multiline: true },
      { key: "howitworks.metaTitle", label: "SEO Başlığı" },
      { key: "howitworks.metaDescription", label: "SEO Açıklaması", multiline: true },
    ],
  },
  {
    title: "İletişim Bilgileri",
    fields: [
      { key: "contact.phone", label: "Telefon" },
      { key: "contact.email", label: "E-posta" },
      { key: "contact.instagram", label: "Instagram Kullanıcı Adı" },
      { key: "contact.address", label: "Adres", multiline: true },
      { key: "contact.cities", label: "Hizmet Verilen Şehirler (virgülle ayırın)" },
    ],
  },
  {
    title: "Ödeme Bilgileri",
    fields: [
      { key: "payment.iban", label: "IBAN" },
      { key: "payment.ibanName", label: "Alıcı Adı" },
      { key: "payment.windowHours", label: "Ödeme Süresi (saat)" },
    ],
  },
  {
    title: "Ses Teslim Sayfası",
    fields: [
      {
        key: "voiceDelivery.defaultMessage",
        label: "Varsayılan Mesaj",
        multiline: true,
      },
    ],
  },
  {
    title: "SEO Varsayılanları",
    fields: [
      { key: "seo.default.title", label: "Varsayılan Sayfa Başlığı" },
      { key: "seo.default.description", label: "Varsayılan Meta Açıklama", multiline: true },
    ],
  },
  {
    title: "Yasal Belgeler",
    fields: [
      { key: "terms.title", label: "Kullanım Koşulları - Başlık" },
      { key: "terms.body", label: "Kullanım Koşulları - Metin", multiline: true },
      { key: "distanceAgreement.title", label: "Mesafeli Kiralama Sözleşmesi - Başlık" },
      { key: "distanceAgreement.body", label: "Mesafeli Kiralama Sözleşmesi - Metin", multiline: true },
      { key: "preInfo.title", label: "Ön Bilgilendirme Formu - Başlık" },
      { key: "preInfo.body", label: "Ön Bilgilendirme Formu - Metin", multiline: true },
      { key: "kvkk.title", label: "KVKK Aydınlatma Metni - Başlık" },
      { key: "kvkk.body", label: "KVKK Aydınlatma Metni - Metin", multiline: true },
    ],
  },
];

export default function ContentEditor({ initialContent }: { initialContent: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: values }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-10">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">{group.title}</h2>
          <div className="space-y-4">
            {group.fields.map((field) =>
              field.theme ? (
                <div key={field.key} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {THEME_OPTIONS.map((opt) => {
                    const active = (values[field.key] || "classic") === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setValues((v) => ({ ...v, [field.key]: opt.value }))}
                        className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-3 text-left transition-colors cursor-pointer ${
                          active ? "border-burgundy bg-rose-pale" : "border-burgundy/10 bg-ivory hover:border-burgundy/40"
                        }`}
                      >
                        <div className="flex gap-1">
                          {opt.swatches.map((c) => (
                            <span key={c} className="h-5 w-5 rounded-full border border-charcoal/10" style={{ background: c }} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-burgundy-dark">{opt.label}</span>
                        <span className="text-xs text-charcoal/60">{opt.hint}</span>
                      </button>
                    );
                  })}
                </div>
              ) : field.image ? (
                <div key={field.key}>
                  <p className="mb-1.5 text-sm font-medium text-charcoal/80">{field.label}</p>
                  <ImageUploader
                    value={values[field.key]}
                    onUploaded={(url) => setValues((v) => ({ ...v, [field.key]: url }))}
                    onRemove={() => setValues((v) => ({ ...v, [field.key]: "" }))}
                  />
                </div>
              ) : field.multiline ? (
                <Textarea
                  key={field.key}
                  label={field.label}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                />
              ) : (
                <Input
                  key={field.key}
                  label={field.label}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                />
              )
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
        {saved && !saving && <span className="text-sm text-emerald-700">Kaydedildi.</span>}
      </div>
    </div>
  );
}
