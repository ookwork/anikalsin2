import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { expireStalePendingReservations } from "@/lib/payments";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Clock, Package, CalendarCheck, TrendingUp, Wallet, HandCoins, Send } from "lucide-react";

export default async function DashboardPage() {
  await expireStalePendingReservations();

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(now);

  const [
    pendingCount,
    activeProductCount,
    recentCount,
    recentReservations,
    monthReservations,
    monthRevenue,
    pendingPaymentTotal,
    awaitingPaymentCount,
    topProductsRaw,
    topCitiesRaw,
  ] = await Promise.all([
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.reservation.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { product: { select: { name: true, price: true } } },
    }),
    prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { eventDate: { gte: monthStart, lt: monthEnd } },
          { eventDate: null, rentalStart: { gte: monthStart, lt: monthEnd } },
        ],
      },
      orderBy: { eventDate: "asc" },
      include: { product: { select: { name: true } } },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.reservation.count({
      where: { status: "CONFIRMED", OR: [{ payment: null }, { payment: { status: "PENDING" } }] },
    }),
    prisma.reservation.groupBy({
      by: ["productId"],
      _count: { _all: true },
      where: { status: { in: ["PENDING", "CONFIRMED", "EXPIRED"] } },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
    prisma.reservation.groupBy({
      by: ["eventCity"],
      _count: { _all: true },
      where: { eventCity: { not: null }, status: { in: ["PENDING", "CONFIRMED", "EXPIRED"] } },
      orderBy: { _count: { eventCity: "desc" } },
      take: 5,
    }),
  ]);

  const productNames = await prisma.product.findMany({
    where: { id: { in: topProductsRaw.map((p) => p.productId) } },
    select: { id: true, name: true },
  });
  const productNameMap = Object.fromEntries(productNames.map((p) => [p.id, p.name]));

  const topProducts = topProductsRaw.map((p) => ({
    label: productNameMap[p.productId] ?? "Bilinmeyen Ürün",
    count: p._count._all,
  }));
  const topCities = topCitiesRaw.map((c) => ({
    label: c.eventCity ?? "Belirtilmemiş",
    count: c._count._all,
  }));
  const maxProductCount = Math.max(1, ...topProducts.map((p) => p.count));
  const maxCityCount = Math.max(1, ...topCities.map((c) => c.count));

  const cards = [
    { label: "Bekleyen Rezervasyon", value: pendingCount, icon: Clock, href: "/admin/reservations?status=PENDING" },
    { label: "Onaylı, Ödeme Bekleyen", value: awaitingPaymentCount, icon: Send, href: "/admin/reservations?status=CONFIRMED" },
    { label: "Bu Ay Tahsilat", value: formatPrice(monthRevenue._sum.amount ?? 0), icon: HandCoins, href: "/admin/reservations" },
    { label: "Bekleyen Ödeme Tutarı", value: formatPrice(pendingPaymentTotal._sum.amount ?? 0), icon: Wallet, href: "/admin/reservations" },
    { label: "Aktif Ürün", value: activeProductCount, icon: Package, href: "/admin/products" },
    { label: "Son 7 Gün Talep", value: recentCount, icon: TrendingUp, href: "/admin/reservations" },
    { label: "Takvim", value: "Görüntüle", icon: CalendarCheck, href: "/admin/reservations/calendar" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Panel</h1>
      <p className="mt-1 text-sm text-charcoal/60">Genel durum özeti</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-pale text-burgundy">
                  <c.icon size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold text-burgundy-dark">{c.value}</p>
              <p className="text-xs text-charcoal/60">{c.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-burgundy-dark">En Çok Talep Gören Ürünler</h2>
          <Card className="mt-4 space-y-3 p-5">
            {topProducts.length === 0 && <p className="text-sm text-charcoal/50">Henüz veri yok.</p>}
            {topProducts.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-charcoal">{p.label}</span>
                  <span className="text-charcoal/60">{p.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-cream">
                  <div
                    className="h-2 rounded-full bg-burgundy"
                    style={{ width: `${(p.count / maxProductCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-burgundy-dark">Şehir Dağılımı</h2>
          <Card className="mt-4 space-y-3 p-5">
            {topCities.length === 0 && <p className="text-sm text-charcoal/50">Henüz veri yok.</p>}
            {topCities.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-charcoal">{c.label}</span>
                  <span className="text-charcoal/60">{c.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-cream">
                  <div
                    className="h-2 rounded-full bg-gold"
                    style={{ width: `${(c.count / maxCityCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-burgundy-dark">
            Bu Ayki Rezervasyonlar <span className="font-normal capitalize text-charcoal/50">({monthLabel})</span>
          </h2>
          <Link href="/admin/reservations/calendar" className="text-sm font-medium text-burgundy hover:underline">
            Takvimde Gör
          </Link>
        </div>
        <p className="mt-1 text-xs text-charcoal/50">
          İleri tarihli rezervasyonların unutulmaması için bu ay teslim edilecek tüm rezervasyonlar burada listelenir.
        </p>

        <Card className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-burgundy/10 text-xs uppercase tracking-wide text-charcoal/50">
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Ürün</th>
                <th className="px-5 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {monthReservations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-charcoal/50">
                    Bu ay için rezervasyon bulunmuyor.
                  </td>
                </tr>
              )}
              {monthReservations.map((r) => (
                <tr key={r.id} className="border-b border-burgundy/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-burgundy-dark">{formatDate(r.eventDate ?? r.rentalStart)}</td>
                  <td className="px-5 py-3 text-charcoal/70">{r.customerName}</td>
                  <td className="px-5 py-3 text-charcoal/70">{r.product.name}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-burgundy-dark">Son Rezervasyonlar</h2>
          <Link href="/admin/reservations" className="text-sm font-medium text-burgundy hover:underline">
            Tümünü Gör
          </Link>
        </div>

        <Card className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-burgundy/10 text-xs uppercase tracking-wide text-charcoal/50">
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Ürün</th>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Fiyat</th>
                <th className="px-5 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-charcoal/50">
                    Henüz rezervasyon yok.
                  </td>
                </tr>
              )}
              {recentReservations.map((r) => (
                <tr key={r.id} className="border-b border-burgundy/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-burgundy-dark">{r.customerName}</td>
                  <td className="px-5 py-3 text-charcoal/70">{r.product.name}</td>
                  <td className="px-5 py-3 text-charcoal/70">{formatDate(r.eventDate ?? r.rentalStart)}</td>
                  <td className="px-5 py-3 text-charcoal/70">{formatPrice(r.product.price)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
