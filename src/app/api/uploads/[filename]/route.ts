import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Next.js'in standalone modu, public/ altındaki statik dosyaları build anında
// tespit ediyor; build sonrası (runtime'da) yüklenen dosyalar bu yüzden statik
// sunumdan geçmiyor ve 404 olarak önbelleğe alınıyor. Bu route, yüklenen
// dosyaları diskten canlı okuyarak bu sorunu bypass eder.
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Geçersiz dosya adı." }, { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü." }, { status: 400 });
  }

  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    const fileStat = await stat(filepath);
    const buffer = await readFile(filepath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }
}
