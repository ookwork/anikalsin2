import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Card } from "@/components/ui/Card";

interface Props {
  searchParams: Promise<{ period?: string }>;
}

const PERIODS = [
  { value: "today", label: "Bugün" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
  { value: "all", label: "Tüm Zamanlar" },
];

const VAT_RATE = 0.2;
const INCOME_TAX_RATE = 0.2;

function getPeriodStart(period: string): Date | undefined {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1));
    return monday;
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return undefined;
}

export default async function AdminRevenuePage({ searchParams }: Props) {
  const { period: rawPeriod } = await searchParams;
  const period = PERIODS.some((p) => p.value === rawPeriod) ? rawPeriod! : "all";
  const periodStart = getPeriodStart(period);

  const [paidAgg, pendingAgg] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "PAID", ...(periodStart && { paidAt: { gte: periodStart } }) },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PENDING", ...(periodStart && { createdAt: { gte: periodStart } }) },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const gross = paidAgg._sum.amount ?? 0;
  const vat = Math.round(gross * VAT_RATE);
  const afterVat = gross - vat;
  const incomeTax = Math.round(afterVat * INCOME_TAX_RATE);
  const net = afterVat - incomeTax;
  const reservationCount = paidAgg._count._all;
  const average = reservationCount > 0 ? Math.round(gross / reservationCount) : 0;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Kazanç ve Vergi</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Tahsil edilen ödemeler üzerinden brüt kazanç, KDV ve gelir vergisi kesintileri sonrası net kazancınızı
        görüntüleyin.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/admin/revenue?period=${p.value}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p.value ? "bg-burgundy text-ivory" : "bg-ivory text-charcoal/60 hover:bg-rose-pale"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
            {PERIODS.find((p) => p.value === period)?.label} Kazanç Dökümü
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-charcoal/70">Brüt Kazanç ({reservationCount} tahsilat)</span>
              <span className="font-semibold text-burgundy-dark">{formatPrice(gross)}</span>
            </div>
            <div className="flex items-center justify-between text-red-700">
              <span>KDV (%{VAT_RATE * 100})</span>
              <span className="font-medium">-{formatPrice(vat)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-burgundy/10 pt-3 text-charcoal/70">
              <span>KDV Sonrası</span>
              <span className="font-medium text-charcoal">{formatPrice(afterVat)}</span>
            </div>
            <div className="flex items-center justify-between text-red-700">
              <span>Gelir Vergisi (%{INCOME_TAX_RATE * 100})</span>
              <span className="font-medium">-{formatPrice(incomeTax)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-rose-pale px-4 py-3 text-base">
              <span className="font-semibold text-burgundy-dark">Net Kazanç</span>
              <span className="font-semibold text-burgundy">{formatPrice(net)}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-charcoal/50">
            Hesaplama, tahsil edilmiş (ödemesi alınan) rezervasyonların toplam tutarı üzerinden yapılır. Gerçek
            vergi yükümlülükleriniz için mali müşavirinize danışmanızı öneririz.
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">Ortalama Rezervasyon</p>
            <p className="mt-2 text-2xl font-semibold text-burgundy-dark">{formatPrice(average)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              Bekleyen Ödemeler ({pendingAgg._count._all})
            </p>
            <p className="mt-2 text-2xl font-semibold text-burgundy-dark">{formatPrice(pendingAgg._sum.amount ?? 0)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
