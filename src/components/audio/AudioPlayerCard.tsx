"use client";

import { useRef, useState } from "react";
import { Play, Pause, Mic2 } from "lucide-react";
import Waveform from "@/components/audio/Waveform";

export default function AudioPlayerCard({
  id,
  title,
  description,
  audioUrl,
}: {
  id: string;
  title: string;
  description?: string | null;
  audioUrl: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-burgundy/10 bg-ivory p-5 sm:p-6">
      <button
        type="button"
        onClick={toggle}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-burgundy text-on-brand transition-transform hover:scale-105 cursor-pointer"
        aria-label={playing ? "Duraklat" : "Dinle"}
      >
        {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-semibold text-burgundy-dark">
          <Mic2 size={15} className="shrink-0 text-gold" />
          {title}
        </p>
        {description && <p className="mt-0.5 text-sm text-charcoal/60">{description}</p>}
        <Waveform seed={id} playing={playing} className="mt-2" />
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
