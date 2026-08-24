import { prisma } from "@/lib/prisma";
import AudioSamplesManager from "@/components/admin/AudioSamplesManager";

export default async function AdminAudioSamplesPage() {
  const audioSamples = await prisma.audioSample.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Ses Örnekleri</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Sitede &quot;Örnek Dinle&quot; bölümünde gösterilen gerçek anı kaydı örneklerini yönetin.
      </p>
      <div className="mt-6">
        <AudioSamplesManager audioSamples={audioSamples} />
      </div>
    </div>
  );
}
