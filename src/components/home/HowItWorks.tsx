import { CalendarCheck, CreditCard, PhoneOutgoing, PackageCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Cihazını Seç",
    description: "Anı telefonu, telefon kulübesi veya ek hizmetlerden size uygun olanı seçin.",
  },
  {
    icon: PhoneOutgoing,
    title: "Rezerve Et",
    description: "Etkinlik tarihini ve teslimat/kurulum adresini girerek rezervasyonunu tamamla.",
  },
  {
    icon: CreditCard,
    title: "Ödemeni Tamamla",
    description: "EFT/Havale veya kredi kartı ile 1 saat içinde öde, rezervasyonun kesinleşsin.",
  },
  {
    icon: PackageCheck,
    title: "Etkinlik ve Kurulum",
    description: "Etkinlik günü ekibimiz misafirleriniz gelmeden önce alanda olur ve kurulumu gerçekleştirir.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Nasıl Çalışır</p>
        <h2 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">
          Cihaz Seçiminden Etkinliğe Dört Adım
        </h2>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative rounded-3xl border border-burgundy/10 bg-ivory p-8 text-center shadow-sm">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-burgundy px-3 py-1 text-xs font-bold text-on-brand">
              {i + 1}
            </span>
            <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-pale text-burgundy">
              <step.icon size={26} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-burgundy-dark">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <ButtonLink href="/nasil-calisir" variant="outline">
          Tüm Süreci İncele
        </ButtonLink>
      </div>
    </section>
  );
}
