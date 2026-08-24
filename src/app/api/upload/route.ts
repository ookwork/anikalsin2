import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  try {
    const { url } =
      type === "video" ? await storage.saveVideo(file) : type === "audio" ? await storage.saveAudio(file) : await storage.save(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Dosya yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
