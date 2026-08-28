import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations/reservation";
import { getReservedQuantity, isDateBlocked } from "@/lib/availability";
import { expireStalePendingReservations } from "@/lib/payments";
import { computeDiscountAmount } from "@/lib/discountCodes";
import { slugify } from "@/lib/format";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Form bilgileri geçersiz.", issues: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const eventDate = startOfDay(data.eventDate);
  const rentalStart = eventDate;
  const rentalEnd = addDays(eventDate, 1);

  try {
    const result = await prisma.$transaction(async (tx) => {
      await expireStalePendingReservations(tx);

      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product || !product.isActive) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (await isDateBlocked(data.productId, eventDate, tx)) {
        throw new Error("DATE_BLOCKED");
      }

      const reserved = await getReservedQuantity(data.productId, rentalStart, rentalEnd, undefined, tx);
      if (product.stockCount - reserved < 1) {
        throw new Error("NOT_AVAILABLE");
      }

      const activeFrameCount = await tx.frame.count({ where: { isActive: true } });
      let frame: { id: string; price: number; isActive: boolean } | null = null;
      if (activeFrameCount > 0) {
        frame = data.frameId ? await tx.frame.findUnique({ where: { id: data.frameId } }) : null;
        if (!frame || !frame.isActive) {
          throw new Error("FRAME_NOT_FOUND");
        }
      }

      let addOns: { id: string; name: string; price: number; category: string }[] = [];
      if (data.addOnIds.length > 0) {
        addOns = await tx.addOn.findMany({
          where: { id: { in: data.addOnIds }, isActive: true },
        });
        const hasStaffService = addOns.some((a) => a.category === "STAFF_SERVICE");
        if (hasStaffService && !slugify(data.eventCity || "").includes("istanbul")) {
          throw new Error("STAFF_SERVICE_ISTANBUL_ONLY");
        }
      }

      let discountCodeId: string | null = null;
      let discountAmount: number | null = null;
      if (data.discountCode) {
        const discountCode = await tx.discountCode.findUnique({
          where: { code: data.discountCode.trim().toUpperCase() },
        });
        if (!discountCode || !discountCode.isActive) {
          throw new Error("INVALID_DISCOUNT_CODE");
        }
        const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
        const subtotal = product.price + (frame?.price ?? 0) + addOnsTotal;
        discountCodeId = discountCode.id;
        discountAmount = computeDiscountAmount(subtotal, discountCode);
      }

      const reservation = await tx.reservation.create({
        data: {
          productId: data.productId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          eventCity: data.eventCity || null,
          deliveryAddress: data.deliveryAddress || null,
          eventDate,
          rentalStart,
          rentalEnd,
          note: data.note || null,
          frameId: frame?.id ?? null,
          framePriceAtBooking: frame?.price ?? null,
          discountCodeId,
          discountAmount,
          addOns: {
            create: addOns.map((a) => ({
              addOnId: a.id,
              priceAtBooking: a.price,
            })),
          },
        },
      });

      return { id: reservation.id };
    });

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_AVAILABLE") {
      return NextResponse.json(
        { error: "Seçtiğiniz tarihte bu ürün müsait değil." },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "DATE_BLOCKED") {
      return NextResponse.json(
        { error: "Seçtiğiniz tarih rezervasyona kapalıdır." },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }
    if (err instanceof Error && err.message === "FRAME_NOT_FOUND") {
      return NextResponse.json({ error: "Lütfen bir çerçeve seçin." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "INVALID_DISCOUNT_CODE") {
      return NextResponse.json({ error: "Girdiğiniz indirim kodu geçerli değil." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "STAFF_SERVICE_ISTANBUL_ONLY") {
      return NextResponse.json(
        { error: "Personel hizmeti yalnızca İstanbul'daki etkinlikler için geçerlidir." },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Rezervasyon oluşturulamadı." }, { status: 500 });
  }
}
