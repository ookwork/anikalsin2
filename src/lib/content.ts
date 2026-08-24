import { prisma } from "@/lib/prisma";

export async function getAllContent(): Promise<Record<string, string>> {
  const rows = await prisma.siteContent.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getContent(key: string, fallback = ""): Promise<string> {
  const row = await prisma.siteContent.findUnique({ where: { key } });
  return row?.value ?? fallback;
}
