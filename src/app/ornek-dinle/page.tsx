import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AudioPlayerCard from "@/components/audio/AudioPlayerCard";
import Waveform from "@/components/audio/Waveform";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Örnek Dinle",
  description: "Anı telefonlarımızdan kaydedilen gerçek sesli anı örneklerini dinleyin.",
};

export default async function ListenSamplesPage() {
  const audioSamples = await prisma.audioSample.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Örnek Dinle</p>
        <h1 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">
          Anı Telefonlarımızdan Gerçek Sesler
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/70 sm:text-base">
          Misafirlerinizin bırakacağı sesli anılar nasıl bir deneyim sunuyor, merak ediyorsanız aşağıdaki gerçek
          kayıt örneklerini dinleyebilirsiniz.
        </p>
        <div className="mt-6 flex justify-center">
          <Waveform seed="hero" bars={36} className="opacity-40" />
        </div>
      </div>

      {audioSamples.length === 0 ? (
        <p className="mt-12 text-center text-charcoal/60">Şu anda dinlenebilecek örnek bulunmuyor.</p>
      ) : (
        <div className="mt-12 space-y-4">
          {audioSamples.map((a) => (
            <AudioPlayerCard key={a.id} id={a.id} title={a.title} description={a.description} audioUrl={a.audioUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
