"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function VoicePasswordForm({ accessToken }: { accessToken: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/voice-deliveries/${accessToken}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Şifre hatalı.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-pale text-burgundy">
        <Lock size={22} />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-semibold text-burgundy-dark">Sesli Anılarınız Hazır</h1>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
        Bu sayfa size özeldir. Görüntülemek için size iletilen şifreyi girin.
      </p>
      <form onSubmit={onSubmit} className="mt-6 w-full space-y-3">
        <Input
          type="password"
          placeholder="Şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
          autoFocus
        />
        <Button type="submit" size="lg" disabled={submitting || !password} className="w-full">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Kontrol ediliyor..." : "Görüntüle"}
        </Button>
      </form>
    </div>
  );
}
