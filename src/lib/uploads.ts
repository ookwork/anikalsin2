import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

export interface UploadStorage {
  save(file: File): Promise<{ url: string }>;
  saveVideo(file: File): Promise<{ url: string }>;
  saveAudio(file: File): Promise<{ url: string }>;
  delete(url: string): Promise<void>;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const ALLOWED_AUDIO_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
};
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024;

class LocalUploadStorage implements UploadStorage {
  async save(file: File): Promise<{ url: string }> {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Sadece JPG, PNG veya WEBP görsel yükleyebilirsiniz.");
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Görsel boyutu 5MB'ı geçemez.");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${crypto.randomUUID()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const optimized = await sharp(buffer)
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    await writeFile(filepath, optimized);

    return { url: `/api/uploads/${filename}` };
  }

  async saveVideo(file: File): Promise<{ url: string }> {
    const extension = ALLOWED_VIDEO_TYPES[file.type];
    if (!extension) {
      throw new Error("Sadece MP4, WEBM veya MOV video yükleyebilirsiniz.");
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new Error("Video boyutu 50MB'ı geçemez.");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${crypto.randomUUID()}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    return { url: `/api/uploads/${filename}` };
  }

  async saveAudio(file: File): Promise<{ url: string }> {
    const extension = ALLOWED_AUDIO_TYPES[file.type];
    if (!extension) {
      throw new Error("Sadece MP3, WAV, M4A veya OGG ses dosyası yükleyebilirsiniz.");
    }
    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      throw new Error("Ses dosyası boyutu 20MB'ı geçemez.");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${crypto.randomUUID()}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    return { url: `/api/uploads/${filename}` };
  }

  async delete(url: string): Promise<void> {
    const filename = url.startsWith("/api/uploads/")
      ? url.slice("/api/uploads/".length)
      : url.startsWith("/uploads/")
        ? url.slice("/uploads/".length)
        : null;
    if (!filename) return;
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      await unlink(filepath);
    } catch {
      // dosya zaten yoksa sorun değil
    }
  }
}

export const storage: UploadStorage = new LocalUploadStorage();
