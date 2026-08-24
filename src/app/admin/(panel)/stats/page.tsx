import Link from "next/link";
import { Eye, Users, Clock3, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/format";
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

function getPeriodStart(period: string): Date | undefined {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const day = now.getDay() === 0 ? 7 : now.getDay();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1));
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return undefined;
}

export default async function AdminStatsPage({ searchParams }: Props) {
  const { period: rawPeriod } = await searchParams;
  const period = PERIODS.some((p) => p.value === rawPeriod) ? rawPeriod! : "all";
  const periodStart = getPeriodStart(period);
  const where = periodStart ? { createdAt: { gte: periodStart } } : {};

  const [totalViews, uniqueVisitorRows, avgDurationAgg, topPages] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.pageView.findMany({ where, distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.pageView.aggregate({ where: { ...where, durationMs: { not: null } }, _avg: { durationMs: true } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where,
      _count: { _all: true },
      _avg: { durationMs: true },
      orderBy: { _count: { path: "desc" } },
      take: 12,
    }),
  ]);

  const uniqueVisitors = uniqueVisitorRows.length;
  const avgDuration = avgDurationAgg._avg.durationMs ?? 0;
  const maxPageCount = Math.max(1, ...topPages.map((p) => p._count._all));

  const cards = [
    { label: "Toplam Ziyaret (Çoğul)", value: totalViews.toLocaleString("tr-TR"), icon: Eye },
    { label: "Tekil Ziyaretçi", value: uniqueVisitors.toLocaleString("tr-TR"), icon: Users },
    { label: "Ortalama Sayfada Kalma Süresi", value: formatDuration(avgDuration), icon: Clock3 },
    { label: "Farklı Sayfa Sayısı", value: topPages.length.toLocaleString("tr-TR"), icon: FileText },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">İstatistikler</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Ziyaretçi sayacı: hangi sayfalar ne kadar görüntülendi, ziyaretçiler sayfada ortalama ne kadar kaldı.
        Kişisel veri toplanmaz, yalnızca anonim bir ziyaretçi kimliği kullanılır.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/admin/stats?period=${p.value}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p.value ? "bg-burgundy text-ivory" : "bg-ivory text-charcoal/60 hover:bg-rose-pale"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-pale text-burgundy">
              <c.icon size={18} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-burgundy-dark">{c.value}</p>
            <p className="text-xs text-charcoal/60">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-burgundy-dark">En Çok Görüntülenen Sayfalar</h2>
        <Card className="mt-4 space-y-4 p-5">
          {topPages.length === 0 && <p className="text-sm text-charcoal/50">Bu dönemde henüz veri yok.</p>}
          {topPages.map((p) => (
            <div key={p.path}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate font-medium text-charcoal">{p.path === "/" ? "Anasayfa" : p.path}</span>
                <span className="shrink-0 text-charcoal/60">
                  {p._count._all.toLocaleString("tr-TR")} görüntüleme
                  {p._avg.durationMs != null && ` · ort. ${formatDuration(p._avg.durationMs)}`}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-cream">
                <div
                  className="h-2 rounded-full bg-burgundy"
                  style={{ width: `${(p._count._all / maxPageCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
