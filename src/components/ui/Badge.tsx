const styles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  EXPIRED: "bg-gray-200 text-gray-600",
};

const labels: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal",
  EXPIRED: "Süresi Doldu",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

const paymentStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  EXPIRED: "bg-gray-200 text-gray-600",
  FAILED: "bg-red-100 text-red-700",
};

const paymentLabels: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödeme Alındı",
  EXPIRED: "Süresi Doldu",
  FAILED: "Başarısız",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        paymentStyles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {paymentLabels[status] ?? status}
    </span>
  );
}
