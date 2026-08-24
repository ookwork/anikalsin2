import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations/content";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-posta ve şifre giriniz." }, { status: 400 });
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const session = await getSession();
  session.adminId = user.id;
  session.adminEmail = user.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
