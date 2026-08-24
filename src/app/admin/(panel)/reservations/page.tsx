import { Suspense } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { expireStalePendingReservations } from "@/lib/payments";
import ReservationsTable from "@/components/admin/ReservationsTable";
import ReservationSearchBox from "@/components/admin/ReservationSearchBox";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminReservationsPage({ searchParams }: Props) {
  const { status, q } = await searchParams;

  await expireStalePendingReservations();

  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (q) exportParams.set("q", q);
  const exportHref = `/api/admin/reservations/export${exportParams.size > 0 ? `?${exportParams.toString()}` : ""}`;

  const reservations = await prisma.reservation.findMany({
    where: q
      ? {
          OR: [
            { customerPhone: { contains: q } },
            { payment: { referenceCode: { contains: q.toUpperCase() } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, price: true } },
      payment: { select: { id: true, referenceCode: true, status: true, amount: true } },
      frame: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Rezervasyonlar</h1>
          <p className="mt-1 text-sm text-charcoal/60">Talepleri onaylayın, reddedin veya yönetin.</p>
        </div>
        <div className="flex items-center gap-4">
          <Suspense fallback={null}>
            <ReservationSearchBox />
          </Suspense>
          <a
            href={exportHref}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-burgundy hover:underline"
          >
            <Download size={15} /> Dışa Aktar (CSV)
          </a>
          <Link href="/admin/reservations/calendar" className="shrink-0 text-sm font-medium text-burgundy hover:underline">
            Takvim Görünümü
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <ReservationsTable reservations={reservations} initialFilter={status ?? "ALL"} />
      </div>
    </div>
  );
}
