"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, Video } from "lucide-react";

interface VideoUploaderProps {
  value?: string;
  onUploaded: (url: string) => void;
}

export default function VideoUploader({ value, onUploaded }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload?type=video", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Video yüklenemedi.");
        return;
      }
      onUploaded(data.url);
    } catch {
      setError("Yükleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const isLocalFile = value?.startsWith("/uploads/");

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
          Video Dosyası Yükle
        </button>
        {isLocalFile && (
          <span className="flex items-center gap-1.5 text-xs text-charcoal/60">
            <Video size={14} /> Dosya yüklendi
            <button type="button" onClick={() => onUploaded("")} className="cursor-pointer">
              <X size={12} />
            </button>
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
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
