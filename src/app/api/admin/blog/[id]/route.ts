import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations/blog";
import { requireAdmin } from "@/lib/auth";
import { sanitizeBlogContent } from "@/lib/sanitizeHtml";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = blogPostSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Form bilgileri geçersiz.", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;

  if (data.slug) {
    const existing = await prisma.blogPost.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 });
    }
  }

  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
  }

  const willPublish = data.isPublished === true && !current.isPublished;

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt || null }),
        ...(data.content !== undefined && { content: sanitizeBlogContent(data.content) }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(willPublish && { publishedAt: new Date() }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
      },
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
