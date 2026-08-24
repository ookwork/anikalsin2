import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, SITE_URL } from "@/lib/jsonld";
import { getContent, getAllContent } from "@/lib/content";
import PageViewTracker from "@/components/analytics/PageViewTracker";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getContent("seo.default.title", "Anıkalsın Event | Sesli Anı Telefonu ve Telefon Kulübesi Kiralama"),
    getContent(
      "seo.default.description",
      "Düğün, nişan ve özel günleriniz için sesli anı telefonu, telefon kulübesi ve etkinlik ekipmanı kiralama."
    ),
  ]);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | Anıkalsın Event" },
    description,
    openGraph: {
      title,
      description,
      siteName: "Anıkalsın Event",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getAllContent();
  const phone = content["contact.phone"] || "0850 000 00 00";
  const email = content["contact.email"] || "info@anikalsin.com.tr";
  const instagram = content["contact.instagram"] || "@anikalsin";
  const cities = content["contact.cities"] || "Türkiye'nin tamamı";
  const theme = content["site.theme"] || "classic";
  const navLabels = Object.fromEntries(Object.entries(content).filter(([key]) => key.startsWith("nav.")));

  return (
    <html
      lang="tr"
      data-theme={theme || "classic"}
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        <JsonLd data={organizationJsonLd()} />
        <PageViewTracker />
        <Header labels={navLabels} />
        <main className="flex-1">{children}</main>
        <Footer phone={phone} email={email} instagram={instagram} cities={cities} />
      </body>
    </html>
  );
}
