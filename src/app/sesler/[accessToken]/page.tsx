import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { getVoiceSession } from "@/lib/voiceSession";
import VoicePasswordForm from "@/components/voice/VoicePasswordForm";
import VoiceDeliveryView from "@/components/voice/VoiceDeliveryView";

interface Props {
  params: Promise<{ accessToken: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sesli Anılarınız",
  robots: { index: false, follow: false },
};

export default async function VoiceDeliveryPage({ params }: Props) {
  const { accessToken } = await params;

  const voiceDelivery = await prisma.voiceDelivery.findUnique({
    where: { accessToken },
    include: { reservation: { select: { customerName: true } } },
  });
  if (!voiceDelivery || !voiceDelivery.isActive) notFound();

  const session = await getVoiceSession();
  const isUnlocked = (session.unlockedTokens ?? []).includes(accessToken);

  if (!isUnlocked) {
    return <VoicePasswordForm accessToken={accessToken} />;
  }

  const defaultMessage = await getContent(
    "voiceDelivery.defaultMessage",
    "Özel gününüzde sevdiklerinizin size bıraktığı sesli anılar hazır! Aşağıdaki butona tıklayarak kayıtlarınızı indirebilirsiniz."
  );

  return (
    <VoiceDeliveryView
      customerName={voiceDelivery.reservation.customerName}
      message={voiceDelivery.message || defaultMessage}
      photoUrl={voiceDelivery.photoUrl}
      driveUrl={voiceDelivery.driveUrl}
    />
  );
}
