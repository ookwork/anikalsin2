import { prisma } from "@/lib/prisma";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-burgundy-dark">Yorumlar</h1>
      <p className="mt-1 text-sm text-charcoal/60">Anasayfada gösterilen müşteri yorumlarını yönetin.</p>
      <div className="mt-6">
        <TestimonialsManager testimonials={testimonials} />
      </div>
    </div>
  );
}
