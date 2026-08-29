import Image from "next/image";
import { Phone, PlayCircle, Wrench, Sparkles, BatteryCharging, ShieldAlert, PackageCheck } from "lucide-react";
import type { ManualPage, ManualPageImage } from "@/generated/prisma/client";

function splitLines(text: string | null) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function StepList({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2.5">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-burgundy/10 bg-ivory p-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-pale font-heading text-sm font-semibold text-burgundy">
            {i + 1}
          </span>
          <p className="pt-0.5 text-sm leading-relaxed text-charcoal/80">{line}</p>
        </div>
      ))}
    </div>
  );
}

function BulletList({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-charcoal/80">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          {line}
        </li>
      ))}
    </ul>
  );
}

function EmergencyStrip({ phone }: { phone: string }) {
  const tel = phone.replace(/\s/g, "");
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-burgundy-dark p-4 text-on-brand">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-on-brand/15">
        <Phone size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-on-brand/70">
          Etkinlik sırasında bir sorun olursa
        </p>
        <a href={`tel:${tel}`} className="font-heading text-lg font-semibold text-on-brand">
          {phone}
        </a>
      </div>
      <a
        href={`tel:${tel}`}
        className="shrink-0 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-burgundy-dark"
      >
        Hemen Ara
      </a>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-burgundy/10 pt-8">
      <h2 className="mb-4 flex items-center gap-2.5 font-heading text-xl font-semibold text-burgundy-dark">
        <Icon size={19} />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ManualPageView({
  productName,
  manualPage,
  phone,
}: {
  productName: string;
  manualPage: ManualPage & { images: ManualPageImage[] };
  phone: string;
}) {
  const setupLines = splitLines(manualPage.setupText);
  const usageLines = splitLines(manualPage.usageText);
  const chargeLines = splitLines(manualPage.chargeText);
  const careLines = splitLines(manualPage.careText);
  const returnLines = splitLines(manualPage.returnText);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">Kullanım Kılavuzu</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-burgundy-dark">{productName}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/70">
          Bu sayfa, kiraladığınız cihazı doğru şekilde kurup kullanmanız — ve etkinliğiniz boyunca içiniz rahat
          etsin diye hazırlandı.
        </p>
      </div>

      <div className="mt-6">
        <EmergencyStrip phone={phone} />
      </div>

      <div className="mt-8 space-y-8">
        {setupLines.length > 0 && (
          <Section icon={Wrench} title="Kurulum">
            <StepList lines={setupLines} />
          </Section>
        )}

        {usageLines.length > 0 && (
          <Section icon={Sparkles} title="Nasıl Kullanılır">
            <StepList lines={usageLines} />
          </Section>
        )}

        {chargeLines.length > 0 && (
          <Section icon={BatteryCharging} title="Şarj Durumu">
            <BulletList lines={chargeLines} />
          </Section>
        )}

        {careLines.length > 0 && (
          <Section icon={ShieldAlert} title="Dikkat Edilmesi Gerekenler">
            <BulletList lines={careLines} />
          </Section>
        )}

        {manualPage.images.length > 0 && (
          <section className="border-t border-burgundy/10 pt-8">
            <h2 className="mb-4 font-heading text-xl font-semibold text-burgundy-dark">Kurulum Görselleri</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {manualPage.images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-rose-pale">
                  <Image src={img.url} alt={img.altText ?? productName} fill className="object-cover" sizes="200px" />
                </div>
              ))}
            </div>
          </section>
        )}

        {manualPage.videoUrl && (
          <section className="border-t border-burgundy/10 pt-8">
            <h2 className="mb-4 flex items-center gap-2.5 font-heading text-xl font-semibold text-burgundy-dark">
              <PlayCircle size={19} /> Video Rehber
            </h2>
            <video controls className="w-full rounded-2xl bg-charcoal" src={manualPage.videoUrl} />
          </section>
        )}

        {returnLines.length > 0 && (
          <Section icon={PackageCheck} title="İade Süreci">
            <BulletList lines={returnLines} />
          </Section>
        )}
      </div>

      <div className="mt-10 rounded-2xl bg-rose-pale p-5 text-center">
        <p className="mb-1.5 text-sm text-charcoal/70">
          Kurulum, kullanım veya iade ile ilgili herhangi bir sorunuzda:
        </p>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-heading text-2xl font-semibold text-burgundy">
          {phone}
        </a>
      </div>

      <p className="mt-8 text-center text-xs text-charcoal/45">
        <strong className="font-heading text-burgundy">Anı Kalsın Event</strong> — bu kılavuz, {productName}{" "}
        kiralamanız için hazırlanmıştır.
      </p>
    </div>
  );
}
