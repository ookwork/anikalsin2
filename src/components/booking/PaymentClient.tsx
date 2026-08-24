"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Loader2, Landmark, CreditCard, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/format";

interface PaymentClientProps {
  reference: string;
  amount: number;
  expiresAt: string;
  iban: string;
  ibanName: string;
}

function useCountdown(expiresAt: string) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remainingMs;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-burgundy/15 bg-cream px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-charcoal/50">{label}</p>
        <p className="truncate text-sm font-medium text-burgundy-dark">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-1 rounded-full border border-burgundy/20 px-3 py-1.5 text-xs font-medium text-burgundy hover:bg-rose-pale cursor-pointer"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Kopyalandı" : "Kopyala"}
      </button>
    </div>
  );
}

export default function PaymentClient({ reference, amount, expiresAt, iban, ibanName }: PaymentClientProps) {
  const router = useRouter();
  const remainingMs = useCountdown(expiresAt);
  const [tab, setTab] = useState<"eft" | "card">("eft");

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (remainingMs <= 0) {
      router.refresh();
    }
  }, [remainingMs, router]);

  if (remainingMs <= 0) {
    return (
      <div className="mt-8 rounded-2xl bg-cream px-5 py-4 text-center text-sm text-charcoal/60">
        Ödeme süresi doldu, sayfa güncelleniyor...
      </div>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const onDemoPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);
    setPaying(true);

    const res = await fetch(`/api/payments/${reference}/demo-pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardNumber, cardHolder, expiry, cvc }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPayError(data.error ?? "Ödeme alınamadı.");
      setPaying(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center gap-2 rounded-xl bg-burgundy-dark px-4 py-3 text-on-brand">
        <Clock3 size={16} />
        <span className="text-sm">Ödeme için kalan süre:</span>
        <span className="font-mono text-lg font-semibold">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("eft")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium cursor-pointer ${
            tab === "eft" ? "border-burgundy bg-burgundy text-on-brand" : "border-burgundy/20 text-charcoal/70"
          }`}
        >
          <Landmark size={16} /> Banka Havalesi / EFT
        </button>
        <button
          type="button"
          onClick={() => setTab("card")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium cursor-pointer ${
            tab === "card" ? "border-burgundy bg-burgundy text-on-brand" : "border-burgundy/20 text-charcoal/70"
          }`}
        >
          <CreditCard size={16} /> Kredi Kartı
        </button>
      </div>

      {tab === "eft" && (
        <div className="mt-5 space-y-3">
          <CopyField label="IBAN" value={iban} />
          <CopyField label="Alıcı Adı" value={ibanName} />
          <CopyField label="Açıklamaya Yazılacak Referans Kodu" value={reference} />
          <p className="rounded-xl bg-gold-light/40 px-4 py-3 text-xs leading-relaxed text-burgundy-dark">
            Havale/EFT açıklamasına mutlaka <strong>{reference}</strong> referans kodunu yazın — ödemenizi bu kodla
            eşleştirip onaylıyoruz. Ödemeniz alındığında rezervasyonunuz otomatik olarak onaylanır.
          </p>
        </div>
      )}

      {tab === "card" && (
        <form onSubmit={onDemoPay} className="mt-5 space-y-4 rounded-2xl border border-gold/40 bg-gold-light/10 p-5">
          <p className="rounded-lg bg-gold-light/50 px-3 py-2 text-xs font-medium text-burgundy-dark">
            Bu bir DEMO ödeme ekranıdır — gerçek bir ödeme altyapısına (iyzico vb.) henüz bağlı değildir, kart
            bilgileriniz saklanmaz. Yakında gerçek kredi kartı ödemesi aktif olacaktır.
          </p>
          <Input
            label="Kart Numarası"
            placeholder="4242 4242 4242 4242"
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <Input
            label="Kart Üzerindeki İsim"
            placeholder="Ad Soyad"
            required
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Son Kullanma (AA/YY)" placeholder="12/28" required value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            <Input label="CVC" placeholder="123" required value={cvc} onChange={(e) => setCvc(e.target.value)} />
          </div>
          {payError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{payError}</p>}
          <Button type="submit" disabled={paying} className="w-full">
            {paying && <Loader2 size={16} className="animate-spin" />}
            {paying ? "İşleniyor..." : `${formatPrice(amount)} Öde (Demo)`}
          </Button>
        </form>
      )}
    </div>
  );
}
