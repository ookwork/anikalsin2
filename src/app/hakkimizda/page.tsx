import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { Heart, Truck, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getContent("about.metaTitle", "Hakkımızda"),
    getContent("about.metaDescription", "Anikalsin hikayemiz ve düğün anı kayıt telefonu kiralama misyonumuz."),
  ]);
  return { title, description };
}

const VALUES = [
  { icon: Heart, title: "Duygusal Anılar", description: "Her cihaz, sevdiklerinizin sesini yıllar sonra tekrar dinleyebilmeniz için özenle hazırlanır." },
  { icon: Truck, title: "Türkiye Geneli Hizmet", description: "Türkiye'nin tamamına kargo, seçili şehirlerde ise saha ekibimizle yerinde kurulum sağlıyoruz." },
  { icon: ShieldCheck, title: "Güvenilir Süreç", description: "Cihaz seçiminden etkinlik günü kurulumuna kadar tüm süreçte yanınızdayız." },
];

export default async function AboutPage() {
  const title = await getContent("about.title", "Hakkımızda");
  const body = await getContent(
    "about.body",
    "Anikalsin olarak, düğün gününüzün en samimi anlarını korumak için yola çıktık."
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Biz Kimiz</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">{title}</h1>
        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-charcoal/75 sm:text-base">{body}</p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-3xl border border-burgundy/10 bg-ivory p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-pale text-burgundy">
              <v.icon size={22} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-burgundy-dark">{v.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal/70">{v.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
