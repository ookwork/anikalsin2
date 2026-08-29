"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, KeyRound, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, FieldWrap } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import type { VoiceDelivery } from "@/generated/prisma/client";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex shrink-0 items-center gap-1 rounded-full border border-burgundy/20 px-2.5 py-1 text-xs font-medium text-burgundy hover:bg-rose-pale cursor-pointer"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

export default function VoiceDeliveryEditor({
  reservationId,
  customerName,
  initial,
  defaultMessagePlaceholder,
}: {
  reservationId: string;
  customerName: string;
  initial: VoiceDelivery | null;
  defaultMessagePlaceholder: string;
}) {
  const router = useRouter();
  const [driveUrl, setDriveUrl] = useState(initial?.driveUrl ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState(initial?.accessToken ?? null);

  const shareUrl = accessToken && typeof window !== "undefined" ? `${window.location.origin}/sesler/${accessToken}` : null;

  const save = async (resetPassword: boolean) => {
    if (resetPassword) setResetting(true);
    else setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/voice-deliveries/${reservationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driveUrl, message, isActive, resetPassword }),
    });
    if (resetPassword) setResetting(false);
    else setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kaydedilemedi.");
      return;
    }
    const data = await res.json();
    setAccessToken(data.voiceDelivery.accessToken);
    if (data.plainPassword) setNewPassword(data.plainPassword);
    router.refresh();
  };

  return (
    <Card className="max-w-xl space-y-4 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">Sesler</p>
        <h2 className="font-heading text-xl font-semibold text-burgundy-dark">{customerName}</h2>
      </div>

      <Input
        label="Google Drive Linki"
        placeholder="https://drive.google.com/..."
        value={driveUrl}
        onChange={(e) => setDriveUrl(e.target.value)}
      />
      <Textarea
        label="Mesaj (opsiyonel)"
        placeholder={defaultMessagePlaceholder}
        hint="Boş bırakılırsa standart mesaj gösterilir."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <FieldWrap label="Fotoğraf">
        <ImageUploader
          value={photoUrl}
          uploadUrl={`/api/admin/voice-deliveries/${reservationId}/photo`}
          onUploaded={(url) => setPhotoUrl(url)}
          onRemove={async () => {
            await fetch(`/api/admin/voice-deliveries/${reservationId}/photo`, { method: "DELETE" });
            setPhotoUrl("");
          }}
        />
      </FieldWrap>
      <label className="flex items-center gap-2 text-sm text-charcoal/80">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-burgundy"
        />
        Sayfa aktif (kapatırsan link çalışmaz)
      </label>

      {error && <p className="text-xs text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-burgundy/10 pt-4">
        <Button onClick={() => save(false)} disabled={saving || resetting}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button variant="outline" onClick={() => save(true)} disabled={saving || resetting}>
          {resetting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {initial ? "Şifreyi Yenile" : "Sayfayı Oluştur"}
        </Button>
      </div>

      {newPassword && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm">
          <p className="font-medium text-emerald-800">
            Yeni şifre: <span className="font-mono text-base tracking-wide">{newPassword}</span>
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Bu şifreyi bir daha göremezsiniz — müşteriye şimdi iletin. Sayfayı yenilerseniz kaybolur.
          </p>
        </div>
      )}

      {shareUrl && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-burgundy/10 bg-ivory px-3.5 py-2.5">
          <span className="truncate text-xs text-burgundy-dark">{shareUrl}</span>
          <CopyButton text={shareUrl} />
        </div>
      )}
    </Card>
  );
}
