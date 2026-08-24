"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploaderProps {
  value?: string | null;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
  uploadUrl?: string;
  label?: string;
}

export default function ImageUploader({
  value,
  onUploaded,
  onRemove,
  uploadUrl = "/api/upload",
  label = "Görsel Yükle",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Yükleme başarısız.");
        return;
      }
      onUploaded(data.url ?? data.image?.url);
    } catch {
      setError("Yükleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-burgundy/15">
          <Image src={value} alt="" fill className="object-cover" sizes="128px" />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-1 top-1 rounded-full bg-charcoal/70 p-1 text-white cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-burgundy/25 text-burgundy/60 hover:border-burgundy hover:text-burgundy cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-xs">{label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
