import { prisma } from "@/lib/prisma";
import { getAllContent } from "@/lib/content";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import StatsBand from "@/components/home/StatsBand";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import LifestyleGallery from "@/components/home/LifestyleGallery";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqAccordion from "@/components/home/FaqAccordion";
import CtaSection from "@/components/home/CtaSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [content, products, testimonials, faqs] = await Promise.all([
    getAllContent(),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { order: "asc" }, take: 6 }),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.faq.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);

  const stats = [
    { value: content["home.stats.weddings"] ?? "", label: content["home.stats.weddings_label"] ?? "Mutlu Çift" },
    { value: content["home.stats.messages"] ?? "", label: content["home.stats.messages_label"] ?? "Kaydedilen Anı" },
    { value: content["home.stats.cities"] ?? "", label: content["home.stats.cities_label"] ?? "İl'e Teslimat" },
    { value: `${testimonials.length > 0 ? "5.0" : "-"}`, label: "Ortalama Puan" },
  ].filter((s) => s.value);

  const galleryImages = [
    content["home.gallery.image1"],
    content["home.gallery.image2"],
    content["home.gallery.image3"],
    content["home.gallery.image4"],
    content["home.gallery.image5"],
    content["home.gallery.image6"],
  ].filter((img): img is string => Boolean(img));

  return (
    <>
      <Hero
        title={content["home.hero.title"] ?? "Düğününüzün Sesi Sonsuza Kalsın"}
        subtitle={
          content["home.hero.subtitle"] ??
          "Anı kayıt telefonlarımızla misafirlerinizin en içten dileklerini kaydedin."
        }
        cta={content["home.hero.cta"] ?? "Hemen Rezervasyon Yap"}
        image={content["home.hero.image"]}
      />
      <HowItWorks />
      {stats.length > 0 && <StatsBand stats={stats} />}
      <FeaturedProducts products={products} />
      <LifestyleGallery images={galleryImages} />
      <TestimonialsSection testimonials={testimonials} />
      <FaqAccordion faqs={faqs} />
      <CtaSection />
    </>
  );
}
