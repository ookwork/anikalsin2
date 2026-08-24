"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, Music } from "lucide-react";

interface AudioUploaderProps {
  value?: string;
  onUploaded: (url: string) => void;
}

export default function AudioUploader({ value, onUploaded }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload?type=audio", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ses dosyası yüklenemedi.");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Yükleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-dashed border-burgundy/30 px-4 py-2.5 text-sm text-burgundy hover:border-burgundy disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Ses Dosyası Yükle
        </button>
        {value && (
          <span className="flex items-center gap-1.5 text-xs text-charcoal/60">
            <Music size={14} /> Dosya yüklendi
            <button type="button" onClick={() => onUploaded("")} className="cursor-pointer">
              <X size={12} />
            </button>
          </span>
        )}
      </div>
      {value && <audio controls src={value} className="mt-2 h-9 w-full max-w-sm" />}
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/ogg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
