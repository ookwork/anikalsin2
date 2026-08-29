import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import VoiceDeliverySearchBox from "@/components/admin/VoiceDeliverySearchBox";
import VoiceDeliveryEditor from "@/components/admin/VoiceDeliveryEditor";

interface Props {
  searchParams: Promise<{ q?: string; reservationId?: string }>;
}

export default async function AdminVoiceDeliveriesPage({ searchParams }: Props) {
  const { q, reservationId } = await searchParams;

  const [reservations, defaultMessage] = await Promise.all([
    prisma.reservation.findMany({
      where: q
        ? { OR: [{ customerName: { contains: q } }, { customerPhone: { contains: q } }] }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { product: { select: { name: true } }, voiceDelivery: { select: { id: true } } },
    }),
    getContent(
      "voiceDelivery.defaultMessage",
      "Özel gününüzde sevdiklerinizin size bıraktığı sesli anılar hazır! Aşağıdaki butona tıklayarak kayıtlarınızı indirebilirsiniz."
    ),
  ]);

  const selected = reservationId
    ? await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { voiceDelivery: true },
      })
    : null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Sesler</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Bir rezervasyon seçip Google Drive linkini ekleyin — şifreli, kişiye özel bir teslim sayfası oluşturulur.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <VoiceDeliverySearchBox />
          <Card className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-burgundy/10 text-xs uppercase tracking-wide text-charcoal/50">
                  <th className="px-5 py-3">Müşteri</th>
                  <th className="px-5 py-3">Ürün</th>
                  <th className="px-5 py-3">Tarih</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Sesler</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-charcoal/50">
                      Rezervasyon bulunamadı.
                    </td>
                  </tr>
                )}
                {reservations.map((r) => (
                  <tr
                    key={r.id}
                    className={`cursor-pointer border-b border-burgundy/5 last:border-0 hover:bg-cream/60 ${
                      reservationId === r.id ? "bg-rose-pale/60" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <Link href={`/admin/voice-deliveries?reservationId=${r.id}`} className="block font-medium text-burgundy-dark">
                        {r.customerName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-charcoal/70">{r.product.name}</td>
                    <td className="px-5 py-3 text-charcoal/70">{formatDate(r.eventDate ?? r.rentalStart)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3">
                      {r.voiceDelivery ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          Gönderildi
                        </span>
                      ) : (
                        <span className="text-xs text-charcoal/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          {selected ? (
            <VoiceDeliveryEditor
              reservationId={selected.id}
              customerName={selected.customerName}
              initial={selected.voiceDelivery}
              defaultMessagePlaceholder={defaultMessage}
            />
          ) : (
            <Card className="p-6 text-sm text-charcoal/50">
              Soldan bir rezervasyon seçin.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
