import { prisma } from "@/lib/prisma";
import { generateReferenceCode } from "@/lib/payments";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function generateUniqueDiscountCode(client: DbClient = prisma) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferenceCode(8);
    const existing = await client.discountCode.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("İndirim kodu üretilemedi.");
}

export { computeDiscountAmount } from "@/lib/pricing";
