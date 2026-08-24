"use client";

/** Rastgele ama tutarlı (id'ye bağlı) çubuk yükseklikleriyle statik/oynatılan bir ses dalgası görseli. */
function seededHeights(seed: string, count: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    heights.push(0.25 + (h % 100) / 130);
  }
  return heights;
}

export default function Waveform({
  seed,
  bars = 24,
  playing = false,
  className = "",
}: {
  seed: string;
  bars?: number;
  playing?: boolean;
  className?: string;
}) {
  const heights = seededHeights(seed, bars);

  return (
    <div className={`flex h-10 items-center gap-[3px] ${className}`}>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] shrink-0 rounded-full bg-burgundy/70 ${playing ? "waveform-bar" : ""}`}
          style={{
            height: `${Math.round(h * 100)}%`,
            animationDelay: playing ? `${(i % 8) * 0.08}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
