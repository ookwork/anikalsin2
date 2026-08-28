import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addOnSchema } from "@/lib/validations/content";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = addOnSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz." }, { status: 400 });
  }
  try {
    const addOn = await prisma.addOn.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description || null }),
        ...(parsed.data.price !== undefined && { price: parsed.data.price }),
        ...(parsed.data.category !== undefined && { category: parsed.data.category }),
        ...(parsed.data.cityRestriction !== undefined && { cityRestriction: parsed.data.cityRestriction || null }),
        ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
    });
    return NextResponse.json({ addOn });
  } catch {
    return NextResponse.json({ error: "Ek hizmet bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.addOn.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Bu ek hizmet geçmiş rezervasyonlarda kullanıldığı için silinemez. Bunun yerine pasif hale getirebilirsiniz.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Ek hizmet bulunamadı." }, { status: 404 });
  }
}
