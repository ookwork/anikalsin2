import Image from "next/image";
import { Download, Heart } from "lucide-react";

export default function VoiceDeliveryView({
  customerName,
  message,
  photoUrl,
  driveUrl,
}: {
  customerName: string;
  message: string;
  photoUrl: string | null;
  driveUrl: string | null;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-pale text-burgundy">
        <Heart size={20} />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold">Anı Kalsın Event</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-burgundy-dark sm:text-3xl">
        Merhaba {customerName}
      </h1>

      {photoUrl && (
        <div className="relative mx-auto mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-rose-pale">
          <Image src={photoUrl} alt="" fill className="object-cover" sizes="512px" />
        </div>
      )}

      <p className="mx-auto mt-6 max-w-md whitespace-pre-line text-sm leading-relaxed text-charcoal/75">
        {message}
      </p>

      <div className="mt-8">
        {driveUrl ? (
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-8 py-4 text-base font-medium text-on-brand transition-colors duration-200 hover:bg-burgundy-dark"
          >
            <Download size={16} /> Sesli Anılarınızı İndirin
          </a>
        ) : (
          <p className="text-sm text-charcoal/50">Ses kayıtlarınız henüz hazırlanıyor, yakında bu sayfada olacak.</p>
        )}
      </div>
    </div>
  );
}
