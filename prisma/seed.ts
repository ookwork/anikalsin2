import "dotenv/config";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const SOURCE_DIR = path.join(process.cwd(), "public", "images");

/** public/images altındaki büyük gerçek fotoğrafları optimize edip public/uploads altına yazar, /uploads/... yolunu döner. */
async function processSeedImage(sourceFilename: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const outputFilename = `seed-${path.parse(sourceFilename).name.toLowerCase()}.webp`;
  const outputPath = path.join(UPLOAD_DIR, outputFilename);

  const buffer = await sharp(path.join(SOURCE_DIR, sourceFilename))
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(outputPath, buffer);
  return `/uploads/${outputFilename}`;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@anikalsin.com.tr";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Anikalsin2026!";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Anı Kalsın Yönetici",
    },
  });

  // anikalsin.com.tr (Anı Kalsın Event) canlı sitesinden aktarılan gerçek ürün fotoğrafları
  const telefonPembe = await processSeedImage("real/telefon-pembe.png");
  const telefonMavi = await processSeedImage("real/telefon-mavi.png");
  const telefonSari = await processSeedImage("real/telefon-sari.png");
  const telefonSiyah = await processSeedImage("real/telefon-siyah.png");
  const telefonKulubesi = await processSeedImage("real/telefon-kulubesi.jpg");

  // Site geneli görseller (hero, galeri)
  const heroImage = await processSeedImage("real/hero-lineup.png");
  const galeri1 = await processSeedImage("real/galeri-1.jpg");
  const galeri2 = await processSeedImage("real/galeri-2.jpg");
  const galeri3 = await processSeedImage("real/galeri-3.jpg");
  const galeri4 = await processSeedImage("real/galeri-4.jpg");
  const galeri5 = await processSeedImage("real/galeri-5.jpg");
  const galeri6 = await processSeedImage("real/galeri-6.jpg");

  const RETRO_TEXT =
    "Retro ahizeli telefonumuzla, özel gününüzde sevdiklerinizin size unutulmaz sesli mesajlar bırakmasına imkan tanıyoruz. Kiralama; masa ve dekor, Anı Kalsın personeli ve özel tasarım çerçeve ile birlikte gelir, etkinliğinizden 1 iş günü önce teslim edilir.";

  const retroModel = await prisma.productModel.upsert({
    where: { slug: "klasik-retro-telefon" },
    update: {},
    create: { slug: "klasik-retro-telefon", name: "Klasik Retro Telefon" },
  });

  const products = [
    {
      slug: "pembe-klasik-retro-telefon",
      name: "Pembe Klasik Retro Telefon",
      shortDescription: "Pastel pembe tonuyla düğün ve nişanlarda öne çıkan zarif bir seçenek.",
      description: RETRO_TEXT,
      price: 4500,
      modelId: retroModel.id,
      colorName: "Pembe",
      colorHex: "#f2a6c6",
      stockCount: 1,
      featuredImageUrl: telefonPembe,
      isActive: true,
      order: 1,
    },
    {
      slug: "mavi-klasik-retro-telefon",
      name: "Mavi Klasik Retro Telefon",
      shortDescription: "Ferahlatıcı mavi-yeşil tonuyla dış mekan düğünlerinde harika duruyor.",
      description: RETRO_TEXT,
      price: 4500,
      modelId: retroModel.id,
      colorName: "Mavi",
      colorHex: "#5b9bd5",
      stockCount: 1,
      featuredImageUrl: telefonMavi,
      isActive: true,
      order: 2,
    },
    {
      slug: "sari-klasik-retro-telefon",
      name: "Sarı Klasik Retro Telefon",
      shortDescription: "Sıcak ve enerjik sarı rengiyle eğlenceli etkinliklerde fark yaratır.",
      description: RETRO_TEXT,
      price: 4500,
      modelId: retroModel.id,
      colorName: "Sarı",
      colorHex: "#f2c14e",
      stockCount: 1,
      featuredImageUrl: telefonSari,
      isActive: true,
      order: 3,
    },
    {
      slug: "siyah-klasik-vintage-telefon",
      name: "Siyah Klasik Vintage Telefon",
      shortDescription: "Şık ve zamansız siyah tasarımıyla klasik düğünlerin favorisi.",
      description: RETRO_TEXT,
      price: 4500,
      modelId: retroModel.id,
      colorName: "Siyah",
      colorHex: "#2b2b2b",
      stockCount: 1,
      featuredImageUrl: telefonSiyah,
      isActive: true,
      order: 4,
    },
    {
      slug: "telefon-kulubesi",
      name: "Telefon Kulübesi",
      shortDescription:
        "Düğününüzdeki en ilgi çekici alanın burası olacağına eminiz. Hem size hem sevdiklerinize harika bir deneyim olacak ve harika anılar birikecek.",
      description:
        "Düğününüzdeki en ilgi çekici alanın burası olacağına eminiz. Hem size hem sevdiklerinize harika bir deneyim olacak ve harika anılar birikecek. Anı Kalsın personeli ve özel tasarım çerçeve dahildir, 1 iş gününde teslim edilir. Anı telefonu, personel, çerçeve ve 360 Video Standı'nın birlikte yer aldığı \"Kulübeli Anı Telefonu\" paketi için bizimle iletişime geçebilirsiniz.",
      price: 9000,
      installmentInfo: "Kulübeli Anı Telefonu paketi (360 Video Standı dahil): 18.000 TL",
      stockCount: 1,
      featuredImageUrl: telefonKulubesi,
      isActive: true,
      order: 5,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  const siteContent: Record<string, string> = {
    "home.hero.title": "Anıları Sevdiklerinizin Sesiyle Saklayın, Asla Unutmayın!",
    "home.hero.subtitle":
      "Düğün, nişan, doğum günü gibi özel günlerinizde farklı bir şey yapmak istiyorsanız \"Sesli Anı Telefonu\" tam size göre. Sevdiklerinize hem renkli ve eğlenceli dakikalar yaşatın hem de kendi seslerinden size mesajlar bırakmalarını sağlayın!",
    "home.hero.cta": "Kiralamak İçin Tıkla",
    "home.hero.image": heroImage,
    "home.stats.weddings": "1000+",
    "home.stats.weddings_label": "Mutlu Müşteri",
    "home.stats.messages": "4.78/5",
    "home.stats.messages_label": "Müşteri Memnuniyeti",
    "home.stats.cities": "9",
    "home.stats.cities_label": "Şehirde Saha Ekibi",
    "home.gallery.image1": galeri1,
    "home.gallery.image2": galeri2,
    "home.gallery.image3": galeri3,
    "home.gallery.image4": galeri4,
    "home.gallery.image5": galeri5,
    "home.gallery.image6": galeri6,
    "about.title": "Hakkımızda",
    "about.body":
      "Anı Kalsın, 2024 yılında OOKWORK bünyesinde kurulmuş ve hizmete başlamıştır. Etkinlikler için özel cihaz, ekip ve ekipman kiralama hizmeti vermekteyiz; en güncel ve yeni cihazları barındırıyoruz. OOKWORK çatısı altında Tour360 (sanal tur hizmetleri), Nereye Mi Gitsek (gezi-seyahat rehberi) ve Anı Kalsın Event (etkinlik ve organizasyon hizmetleri) yer almaktadır. Cihazınızı seçmenizden etkinlik günü kurulumuna kadar tüm süreci ekibimizle birlikte sorunsuz şekilde yürütüyoruz.",
    "about.metaTitle": "Hakkımızda",
    "about.metaDescription": "Anikalsin hikayemiz ve düğün anı kayıt telefonu kiralama misyonumuz.",
    "howitworks.intro":
      "Anı Kalsın ile düğününüzün sesini ölümsüzleştirmek beş basit adımdan oluşur: cihaz seçimi, rezervasyon, ödeme, kurulum ve kullanım.",
    "howitworks.step1.title": "1. Cihazınızı Seçin",
    "howitworks.step1.description":
      "Anı telefonu modelini, telefon kulübesini veya sis makinesi, 360 video standı, kamera adam gibi ek hizmetleri seçin.",
    "howitworks.step2.title": "2. Rezervasyon Yapın",
    "howitworks.step2.description":
      "Etkinlik tarihinizi ve teslimat/kurulum adresinizi girerek rezervasyonunuzu birkaç dakikada tamamlayın.",
    "howitworks.step3.title": "3. Ödemenizi Tamamlayın",
    "howitworks.step3.description":
      "Rezervasyon sonrası size özel bir ödeme sayfası açılır. Banka havalesi/EFT veya kredi kartı ile 1 saat içinde ödemenizi tamamlayın — aksi halde tarih tekrar müsait hale gelir.",
    "howitworks.step4.title": "4. Etkinlik Günü Kurulum",
    "howitworks.step4.description":
      "Saha ekibimizin bulunduğu şehirlerde ekibimiz misafirleriniz gelmeden önce alanda olur ve kurulumu yapar; diğer illerde cihazınız kargo ile adresinize ulaşır.",
    "howitworks.step5.title": "5. Misafirleriniz Anılarını Bıraksın",
    "howitworks.step5.description":
      "Ahize kaldırıldığında misafirleriniz dilediği kadar konuşup sesli mesajını kaydedebilir; etkinlik sonrası kayıtlarınızın teslimatı için ekibimiz sizinle iletişime geçer.",
    "howitworks.metaTitle": "Nasıl Çalışır?",
    "howitworks.metaDescription": "Cihaz seçimi, rezervasyon, ödeme ve etkinlik günü sürecimiz adım adım.",
    "nav.urunler": "Ürünlerimiz",
    "nav.nasilCalisir": "Nasıl Çalışır",
    "nav.ornekDinle": "Örnek Dinle",
    "nav.blog": "Blog",
    "nav.sss": "S.S.S.",
    "nav.hakkimizda": "Hakkımızda",
    "nav.iletisim": "İletişim",
    "nav.cta": "Rezervasyon Yap",
    "contact.phone": "0537 672 35 52",
    "contact.email": "info@anikalsinevent.com.tr",
    "contact.instagram": "anikalsinevent",
    "contact.address": "Fenerbahçe, Iğrıp Sk. No: 13, 34726 Kadıköy/İstanbul",
    "contact.cities": "İstanbul, İzmir, Aydın, Denizli, Tokat, Fethiye, Dalaman, Burdur, Marmaris",
    "payment.iban": "TR110003200000000055672097",
    "payment.ibanName": "OSMAN OĞUZ KORAL",
    "payment.windowHours": "1",
    "seo.default.title": "Anı Kalsın Event | Sesli Anı Telefonu ve Telefon Kulübesi Kiralama",
    "seo.default.description":
      "Düğün, nişan ve özel günleriniz için sesli anı telefonu, telefon kulübesi, 360 video standı ve videolu tebrik kutusu kiralama. Türkiye genelinde kargo, İstanbul, İzmir, Aydın, Denizli, Tokat, Fethiye, Dalaman, Burdur ve Marmaris'te saha ekibiyle hizmet.",
    "terms.title": "Kullanım Koşulları",
    "terms.body": `1. Kiralama Süreci
Anı Kalsın üzerinden yapılan her rezervasyon, seçilen tarih için bir cihazın (anı telefonu, telefon kulübesi veya ek hizmet) kiralanmasını kapsar. Rezervasyon, ödeme onaylandıktan sonra kesinleşir.

2. Ödeme ve Rezervasyon Süresi
Rezervasyon oluşturulduktan sonra ödemenizi tamamlamanız için 1 saat süreniz vardır. Bu süre içinde ödeme yapılmazsa rezervasyon otomatik olarak iptal edilir ve tarih tekrar müsait hale gelir; yeniden rezervasyon yapmanız gerekir.

3. Teslimat ve Kurulum
Hizmet bölgelerimizde (İstanbul, İzmir, Aydın, Denizli, Tokat, Fethiye, Dalaman, Burdur, Marmaris) ekibimiz etkinlik günü misafirleriniz gelmeden önce alanda olur ve kurulumu gerçekleştirir. Diğer illerde cihazlar kargo ile gönderilir.

4. İptal ve Değişiklik
Ödemesi tamamlanmış rezervasyonların iptal/değişiklik talepleri için mümkün olan en kısa sürede bizimle iletişime geçilmesi gerekmektedir.

5. Sorumluluk
Cihazın etkinlik süresince hasar görmesi veya kaybolması durumunda, cihaz bedeli müşteriden tahsil edilir. Cihazların kullanım talimatına uygun şekilde kullanılması rica olunur.

6. Ek Hizmetler
Sis makinesi, 360 video standı, kamera adam ve videolu tebrik kutusu gibi ek hizmetlerin fiyatı etkinliğinize göre değişiklik gösterebileceğinden teklif üzerine sunulmaktadır.`,
    "distanceAgreement.title": "Mesafeli Kiralama Sözleşmesi",
    "distanceAgreement.body": `MADDE 1 - TARAFLAR
İşbu sözleşme, bir tarafta Anı Kalsın Event (OOKWORK) ("KİRAYA VEREN") ile diğer tarafta rezervasyon sırasında bilgilerini paylaşan müşteri ("KİRACI") arasında elektronik ortamda kurulmuştur.

KİRAYA VEREN
Unvan: Anı Kalsın Event (OOKWORK)
Adres: Fenerbahçe, Iğrıp Sk. No: 13, 34726 Kadıköy/İstanbul
Telefon: 0537 672 35 52
E-posta: info@anikalsinevent.com.tr

MADDE 2 - SÖZLEŞMENİN KONUSU
İşbu sözleşmenin konusu, KİRACI'nın internet sitesi üzerinden elektronik ortamda siparişini verdiği, aşağıda nitelikleri ve kira bedeli belirtilen ürünün (anı kayıt telefonu, telefon kulübesi ve/veya seçilen ek hizmetler) belirli bir süre için kiralanmasına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

MADDE 3 - KİRALANAN ÜRÜN BİLGİLERİ VE KİRA BEDELİ
Kiralanan ürünün cinsi, adedi, rengi/çerçeve seçimi, seçilen ek hizmetler, kira başlangıç-bitiş tarihleri ve toplam kira bedeli, rezervasyon sırasında KİRACI'ya gösterilen ve onaylattırılan sipariş özetinde ve rezervasyon sonrası KİRACI'ya iletilen ödeme sayfasında yer almaktadır.

MADDE 4 - TESLİMAT VE İADE
Ürün, hizmet bölgesi dahilindeki illerde KİRAYA VEREN'in saha ekibi tarafından etkinlik günü teslim edilip kurulur; hizmet bölgesi dışındaki illerde kargo ile gönderilir. KİRACI, kiralama süresi sonunda ürünü teslim aldığı haliyle, hasarsız ve eksiksiz olarak iade etmekle yükümlüdür.

MADDE 5 - CAYMA HAKKI
Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, belirli bir tarihte veya dönemde yapılması gereken, niteliği gereği hazırlanması zaman alan ve/veya belirli bir etkinlik tarihine özgülenen kiralama hizmetlerinde cayma hakkı bulunmamaktadır. KİRACI, rezervasyon oluştururken bu hususu kabul etmiş sayılır. Cayma hakkının bulunmadığı durumlarda dahi, ödeme henüz tamamlanmamış rezervasyonlar KİRACI tarafından herhangi bir yaptırım olmaksızın iptal edilebilir.

MADDE 6 - ÖDEME
Kira bedeli, rezervasyon onayı sonrası KİRACI'ya iletilen ödeme sayfası üzerinden banka havalesi/EFT veya kredi kartı ile, belirtilen süre içinde ödenir. Süresi içinde ödeme yapılmayan rezervasyonlar iptal edilir.

MADDE 7 - SORUMLULUK
KİRACI, kiraladığı ürünü özenle kullanmakla, ürünün hasar görmesi veya kaybolması halinde bedelini KİRAYA VEREN'e ödemekle yükümlüdür.

MADDE 8 - UYUŞMAZLIKLARIN ÇÖZÜMÜ
İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığınca ilan edilen değere kadar KİRACI'nın yerleşim yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.

KİRACI, rezervasyonu tamamlayarak işbu Mesafeli Kiralama Sözleşmesi'ni okuduğunu ve içeriğini kabul ettiğini beyan eder.`,
    "preInfo.title": "Ön Bilgilendirme Formu",
    "preInfo.body": `1. SATICI BİLGİLERİ
Unvan: Anı Kalsın Event (OOKWORK)
Adres: Fenerbahçe, Iğrıp Sk. No: 13, 34726 Kadıköy/İstanbul
Telefon: 0537 672 35 52
E-posta: info@anikalsinevent.com.tr

2. ÜRÜN/HİZMETİN TEMEL NİTELİKLERİ
Kiralanan ürünün türü (anı kayıt telefonu, telefon kulübesi vb.), rengi/çerçeve seçimi, seçilen ek hizmetler ve kiralama süresi, rezervasyon sırasında sipariş özetinde ayrıntılı olarak gösterilir.

3. TOPLAM BEDEL VE ÖDEME ŞEKLİ
Ürün kira bedeli, seçilen ek hizmetler, uygulanan indirim (varsa) ve toplam ödenecek tutar, rezervasyon onayı sonrası iletilen ödeme sayfasında açıkça belirtilir. Ödeme; banka havalesi/EFT veya kredi kartı ile yapılabilir.

4. TESLİMAT BİLGİLERİ
Hizmet bölgesi illerinde saha ekibi ile yerinde kurulum, diğer illerde kargo ile teslimat yapılır. Teslimat süresi ve şekli rezervasyon onayı sırasında KİRACI'ya bildirilir.

5. CAYMA HAKKI
Belirli bir etkinlik tarihine özgülenen kiralama hizmetlerinin niteliği gereği, Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi kapsamında cayma hakkı bulunmamaktadır. Ödemesi tamamlanmamış rezervasyonlar herhangi bir yaptırım olmaksızın iptal edilebilir.

6. ŞİKAYET VE İTİRAZLARIN İLETİLMESİ
KİRACI, şikayet ve itirazlarını yukarıda yer alan iletişim bilgileri üzerinden KİRAYA VEREN'e iletebilir; çözülemeyen uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.

Rezervasyonu tamamlayan KİRACI, işbu Ön Bilgilendirme Formu'nu okuduğunu ve bilgilendirildiğini kabul eder.`,
    "kvkk.title": "KVKK Aydınlatma Metni",
    "kvkk.body": `Anı Kalsın Event (OOKWORK) ("Veri Sorumlusu") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin işlenmesine ilişkin sizleri aydınlatmak isteriz.

1. İŞLENEN KİŞİSEL VERİLER
Rezervasyon ve iletişim sürecinde; ad-soyad, telefon numarası, e-posta adresi, teslimat/etkinlik adresi ve şehri, ödeme işlemine ilişkin sınırlı bilgiler (banka referans kodu vb.) işlenmektedir.

2. İŞLEME AMAÇLARI
Kişisel verileriniz; rezervasyon taleplerinizin alınması ve onaylanması, ödeme süreçlerinin yürütülmesi, kiralanan ürünün teslimat/kurulumunun sağlanması, müşteri ile iletişimin sürdürülmesi ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenmektedir.

3. KİŞİSEL VERİLERİN AKTARILMASI
Kişisel verileriniz; kargo/lojistik hizmet sağlayıcıları, ödeme altyapısı sağlayan kuruluşlar ve yasal olarak yetkili kamu kurum ve kuruluşları ile, yalnızca hizmetin ifası ve yasal yükümlülüklerin yerine getirilmesi amacıyla sınırlı olarak paylaşılabilir.

4. TOPLAMA YÖNTEMİ VE HUKUKİ SEBEP
Kişisel verileriniz, internet sitemiz üzerindeki rezervasyon formu aracılığıyla, bir sözleşmenin kurulması ve ifası ile hukuki yükümlülüğün yerine getirilmesi hukuki sebeplerine dayanılarak elektronik ortamda toplanmaktadır.

5. HAKLARINIZ
KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, KVKK'da öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme ve bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz.

Bu haklarınızı kullanmak için info@anikalsinevent.com.tr adresinden bizimle iletişime geçebilirsiniz.`,
  };

  for (const [key, value] of Object.entries(siteContent)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  const testimonials = [
    {
      authorName: "Melike B.",
      authorLocation: "Pembe Telefon ve Telefon Kulübesi",
      content:
        "Nişanım için kiraladım. Bir firmaya daha baktım fakat o firma kargo ile gönderiyormuş. Nişanımda kargo al getir kur sonra geri gönder onla uğraşmak aşırı zor geldiği için sesli hatıra telefonundan vazgeçmiştim. Anı kalsın firmasının kendi operatörleri ile gönderdiklerini ve etkinlikte ve sonrasında beni hiç bir şeyle uğraştırmayacaklarını öğrenince hemen kiraladım. Oldukça memnun kaldım. Gönül rahatlığı ile kiralayabilirsiniz.",
      rating: 5,
      order: 1,
    },
    {
      authorName: "Mertcan S.",
      authorLocation: "Siyah Retro Telefon",
      content:
        "Düğün telaşı ile böyle bir şey kiraladığım aklımdan bile çıkmış. Düğünden önce aradılar teyitleştik. Düğün günü geldiler ve çok güzel bir masa ve çok güzel bir ortam kurdular. Neredeyse düğündeki herkes fotoğraf çektirdi ve bize anı bıraktı. Çok ilgilendiler ve her şey çok güzeldi. Düğün gecesi benim eve girmem saat 3'ü geçti, sabah 9'da sesler bana gelmişti. Çok teşekkür ederim harika bir ekip.",
      rating: 5,
      order: 2,
    },
    {
      authorName: "Büşra S.",
      authorLocation: "Sarı Telefon ve Telefon Kulübesi",
      content:
        "Ne kadar tatlı güler yüzlü insanlar. Düğün sürecimde en ama en tatlı geçen şeydi. Bize bırakılan mesajları defalarca kez dinledik ve çok eğlendik.",
      rating: 5,
      order: 3,
    },
  ];

  for (const t of testimonials) {
    const exists = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!exists) {
      await prisma.testimonial.create({ data: t });
    }
  }

  // Not: anikalsin.com.tr üzerindeki S.S.S. bölümünde sorular yayında ancak cevap metinleri
  // hiç doldurulmamış (akordeon açılınca içerik boş geliyor). Sorular gerçek siteden birebir
  // alınmıştır; cevaplar ise sitenin diğer sayfalarındaki (Hakkımızda, İletişim) bilgilerden
  // yola çıkılarak makul varsayılanlar olarak yazılmıştır — admin panelinden gözden geçirip
  // güncellemeniz önerilir.
  const faqs = [
    {
      question: "Kurulum gerekli mi?",
      answer:
        "Hayır, kuruluma gerek yok. Etkinlik günü Anı Kalsın ekibimiz misafirleriniz gelmeden önce alanda olur ve cihazın kurulumunu bizzat gerçekleştirir.",
      order: 1,
    },
    {
      question: "Priz veya Wifi gerekir mi?",
      answer:
        "Hayır, cihazlarımız şarjlı pil ile çalışır ve internet bağlantısına ihtiyaç duymaz; mekanınızda priz veya wifi aramanıza gerek kalmaz.",
      order: 2,
    },
    {
      question: "Kayıt için sınır bulunuyor mu?",
      answer:
        "Cihazlarımızda kayıt süresi ve misafir sayısı için pratik bir sınır bulunmuyor; kapasite etkinliğiniz boyunca yeterli olacak şekilde ayarlanmıştır.",
      order: 3,
    },
    {
      question: "Kayıtları ne zaman teslim alabiliriz",
      answer:
        "Etkinliğiniz sona erdikten sonra ekibimiz sizinle iletişime geçerek kayıtlarınızın teslimatını organize eder.",
      order: 4,
    },
    {
      question: "Ne kadar süre önceden rezervasyon yapmalıyız?",
      answer:
        "Cihaz ve tarih müsaitliğini garantilemek için etkinliğinizden en az birkaç hafta önce rezervasyon yaptırmanızı öneririz; yoğun sezonlarda bu süre daha da önemlidir.",
      order: 5,
    },
    {
      question: "Hangi şehirlerde hizmet veriyorsunuz",
      answer:
        "Türkiye'nin tamamına kargo ile gönderim yapıyoruz; İstanbul, İzmir, Aydın, Denizli, Tokat, Fethiye, Dalaman, Burdur ve Marmaris'te ayrıca saha ekibimizle yerinde hizmet veriyoruz.",
      order: 6,
    },
    {
      question: "İptal durumunda ücret iadesi alabilir miyim?",
      answer:
        "İptal ve değişiklik talepleri için lütfen en kısa sürede bizimle iletişime geçin; ödemesi tamamlanmış rezervasyonlarda iade koşulları etkinlik tarihine kalan süreye göre değerlendirilir.",
      order: 7,
    },
  ];

  for (const f of faqs) {
    const exists = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!exists) {
      await prisma.faq.create({ data: f });
    }
  }

  const addOns = [
    {
      name: "Bulut Yapan Sis Makinesi",
      description: "Sahne ve dans alanınıza sinematik bir görünüm katan sis makinesi hizmeti.",
      price: 0,
      category: "ACCESSORY" as const,
      cityRestriction: null,
      order: 1,
    },
    {
      name: "360 Video Standı",
      description: "Siz ve misafirleriniz için eğlenceli ve paylaşılabilir 360 derece video deneyimi.",
      price: 0,
      category: "ACCESSORY" as const,
      cityRestriction: null,
      order: 2,
    },
    {
      name: "Video Tebrik Kutusu",
      description:
        "Misafirleriniz kutunun karşısına geçip söylemek istediklerini video olarak bırakır, siz de renkli ve unutulmaz anılarla ayrılırsınız.",
      price: 0,
      category: "ACCESSORY" as const,
      cityRestriction: null,
      order: 3,
    },
    {
      name: "Kamera Adam",
      description: "Etkinliğiniz boyunca profesyonel kamera operatörümüz görüntülerinizi kaydeder.",
      price: 0,
      category: "STAFF_SERVICE" as const,
      cityRestriction: null,
      order: 4,
    },
  ];

  for (const a of addOns) {
    const exists = await prisma.addOn.findFirst({ where: { name: a.name } });
    if (!exists) {
      await prisma.addOn.create({ data: a });
    }
  }

  // anikalsin.com.tr üzerindeki SEO/blog amaçlı alt sayfalardan (anasayfada gösterilmeyen,
  // arama motorları için hazırlanmış) aktarılan gerçek içerikler.
  const blogPosts = [
    {
      slug: "ani-kayit-telefonu-nedir",
      title: "Anı Kayıt Telefonu Nedir? 2025 Düğün Trendleri ile Unutulmaz Sesli Hatıralar",
      excerpt:
        "2025 düğün trendlerinin vazgeçilmezlerinden anı kayıt telefonu nasıl çalışır, hangi renk seçenekleri var? Hepsini anlatıyoruz.",
      coverImage: heroImage,
      metaTitle: "Anı Kayıt Telefonu Nedir?",
      metaDescription:
        "Anı kayıt telefonu nasıl çalışır, hangi renk seçenekleri var? Düğün, nişan ve doğum günlerinde sesli hatıra bırakmanın en özel yolu.",
      content: `2025 düğün trendlerinin vazgeçilmezlerinden olan anı kayıt telefonu ile özel günlerinizi ölümsüzleştirin! Düğün, nişan, doğum günü gibi organizasyonlarda misafirleriniz, telefonun ahizesini kaldırarak size özel anılarını ve dileklerini sesli bir anı olarak bırakabilir. Bu cihaz, sadece bir telefon değil; geçmişin nostaljisini, geleceğe taşınan hatıralara dönüştüren bir köprü. Anı kayıt telefonu, unutulmaz bir deneyim sunarak sevdiklerinizle sesli hatıralar oluşturmanızı sağlar. Her bir kayıt, gelecekte sizi özel gününüzde hissettiğiniz duygulara geri götürecek.

Anı Kayıt Telefonu Nasıl Çalışır?

Anı kaydı yapmak artık çok kolay! Anı kayıt telefonu, konuklarınızın duygu ve düşüncelerini ifade etmek için ahizeyi kaldırıp mesaj bırakmasına olanak tanır. Her bir kayıt yüksek kaliteli formatta saklanır ve etkinlik sonrasında dijital ortamda size sunulur. Böylece düğün ve nişan gibi özel günlerde misafirlerinizin bıraktığı her sesli hatıra, yıllar boyunca yeniden dinlenebilecek kalıcı bir anıya dönüşür.

Anı Kayıt Telefonunun Renk Seçenekleri

Bu telefonun pembe, beyaz, siyah, sarı ve mavi olmak üzere çeşitli renk seçenekleri bulunur, böylece düğün ve nişan konseptinize mükemmel uyum sağlar. Her bir renk, organizasyonunuzun temasını tamamlar ve dikkat çekici bir dekoratif unsur sunar. Bu renk seçenekleri hem estetik uyum sağlıyor hem de konukların ilgisini çekiyor.

Anı Kalsın: Geleceğe Sesli Bir Bağ Kurun

Anı kayıt telefonu ile geleneksel hatıra defterlerinden daha özel bir deneyim sunabilirsiniz. Konuklarınızın o günkü duygularını kaydederek özel anılarını sesli olarak bırakmalarını sağlayan bu cihaz, hem konuklarınıza hem de size unutulmaz birer hatıra bırakıyor. Bu sesli hatıralar sayesinde, düğün gününüzün her bir anını yeniden yaşamanız mümkün.

Anı Kayıt Telefonu ile Özel Günlerinizi Unutulmaz Hale Getirin

Hızla popülerleşen bu benzersiz cihaz, anı kaydı yapmayı daha anlamlı hale getiriyor. Konuklarınızın sizin için bıraktığı sesli mesajlar, yalnızca bir gün değil, ömür boyu saklayabileceğiniz bir hazineye dönüşüyor. Geleneksel hatıraların ötesine geçmek isteyenler için anı kayıt telefonu, en güzel hatıraları bir araya getiren özel bir köprü.

Özel günlerinizi unutulmaz kılmak ve her detayı yıllarca hatırlamak istiyorsanız, anı kayıt telefonu tam size göre!`,
    },
    {
      slug: "retro-news-gazete-booth",
      title: "Retro News: Türkiye'nin İlk ve Tek Anı Gazetesi Gazete Booth Deneyimi",
      excerpt:
        "Klasik fotobooth'u unutun — Retro News ile misafirleriniz kendi manşetleriyle basılı bir Anı Gazetesi sayfasıyla etkinlikten ayrılıyor.",
      coverImage: null as string | null,
      metaTitle: "Retro News Gazete Booth",
      metaDescription:
        "Türkiye'nin ilk ve tek Gazete Booth deneyimi Retro News ile düğün, nişan, doğum günü ve kurumsal etkinliklerde unutulmaz Anı Gazetesi anıları.",
      content: `Etkinliklerde fotoğraf köşeleri artık bir gelenek haline geldi. Ancak klasik fotoğraf kabinleri ve fotobooth çözümleri artık sıradanlaştı. İşte tam bu noktada sahneye çıkan Retro News, organizasyon dünyasında bir ilki gerçekleştiriyor.

Retro News, katılımcılara fotoğrafın ötesinde bir deneyim sunuyor: Gazete Booth. Çekilen kareler anında tasarlanmış bir Anı Gazetesi formatında basılıyor. Böylece düğün, nişan, doğum günü, parti, lansman ve kurumsal etkinliklerde misafirler sadece bir fotoğraf değil, kendi manşetlerinin yıldızı oldukları özel bir gazete sayfası ile anılarını ölümsüzleştiriyor.

Anı Gazetesi (Retro News - Gazete Booth) Nedir?

Anı Gazetesi, Retro News'in sunduğu özel bir hatıra konseptidir. Misafirleriniz etkinlikte fotoğraf çektirdiğinde, bu kareler kişiye özel bir gazete sayfasına dönüştürülür. Bir düğünde gelin ve damat kendi aşk hikâyelerinin başrolü olurken, nişan töreninde çiftin mutluluğu gazetenin manşetine taşınır. Partilerde arkadaş grupları kendi eğlenceli haberleriyle yer alırken, kurumsal etkinliklerde markalarına özel hazırlanmış gazete sayfaları katılımcılara dağıtılır.

Retro News ve Gazete Booth Deneyiminin Etkinliklere Katkısı

1. Türkiye'de İlk ve Tek: Retro News, Türkiye'de ilk ve tek Gazete Booth sistemidir. Bu nedenle düğün, nişan, parti ve kurumsal etkinliklerde fark yaratmak isteyenlerin ilk tercihi olur.

2. Düğün ve Nişanlarda Anı Gazetesi ile Ölümsüz Anılar: Geleneksel fotobooth yerine Retro News Anı Gazetesi tercih eden çiftler, misafirlerine unutulmaz bir hediye sunar. Her davetli, özel bir gazete manşetinde yer alarak etkinlikten eşsiz bir hatıra ile ayrılır.

3. Partiler ve Doğum Günlerinde Gazete Booth Eğlencesi: Doğum günlerinde ve özel partilerde Gazete Booth deneyimi, eğlenceli başlıklar ve yaratıcı tasarımlarla geceyi unutulmaz kılar.

4. Kurumsal Etkinlik ve Lansmanlarda Marka Değeri: Şirket logonuz, sloganınız ya da yeni ürününüz Gazete Booth çıktılarında yer alır. Böylece katılımcılar markanızla bütünleşmiş özel bir anı gazetesi ile etkinlikten ayrılır.

5. Anı Kalsın Event Güvencesi: Retro News, etkinlik sektörünün güvenilir markası Anı Kalsın Event tarafından hayata geçirilmiştir. Profesyonel ekibiyle organizasyonunuza sorunsuz şekilde entegre edilir.

Neden Retro News Gazete Booth?
- Sıradan fotobooth yerine Gazete Booth ile farklı bir deneyim
- Etkinliğe özel hazırlanmış Anı Gazetesi tasarımları
- Düğün, nişan, parti, lansman ve kurumsal etkinliklerde unutulmaz bir konsept
- Türkiye'de ilk ve tek Retro News Anı Gazetesi Gazete Booth
- Profesyonel hizmet: Anı Kalsın Event güvencesi

Sonuç: Anılarınızı Manşete Taşıyan Retro News

Retro News, Türkiye'de ilk ve tek olan Gazete Booth sistemiyle etkinliklere farklı bir bakış açısı kazandırıyor. Düğün, nişan, doğum günü, parti, kurumsal etkinlik ve lansmanlarda katılımcılara eşsiz bir anı gazetesi sunan Retro News, organizasyon dünyasında trendleri yeniden tanımlıyor. Siz de etkinliklerinizi unutulmaz kılmak istiyorsanız, Anı Kalsın Event güvencesiyle Retro News'i tercih edin.`,
    },
    {
      slug: "denizli-ani-telefonu-kiralama",
      title: "Denizli'de Anı Telefonu Kiralama",
      excerpt: "Denizli'nin ilk ve tek sesli anı kayıt telefonu kiralama hizmeti Anı Kalsın Event'te.",
      coverImage: telefonPembe,
      metaTitle: "Denizli Anı Telefonu Kiralama",
      metaDescription:
        "Denizli'de düğün, nişan ve kına için sesli anı kayıt telefonu kiralama. Denizli'nin ilk ve tek anı telefonu hizmeti Anı Kalsın Event'te.",
      content: `Denizli'de sesli hatıra telefonu arayanlar için müjde: Anı Kalsın Event artık Denizli'de! Denizli'nin ilk ve tek anı kayıt telefonu kiralama hizmeti için bize ulaşabilirsiniz.

Farklı renk ve modellerde sesli anı kayıt telefonlarımızla düğün, nişan, kına gibi özel günlerinizi unutulmaz sesli hatıralarla taçlandırın. Misafirleriniz ahizeyi kaldırıp size özel mesajlarını bırakır, siz de yıllar sonra o sesleri tekrar dinleyebilirsiniz.

Anı telefonu kiralama fiyatımız masa ve dekor, Anı Kalsın personeli ve özel tasarım çerçeve dahil olmak üzere 4.500 TL'den başlıyor; en çok tercih edilen Kulübeli Anı Telefonu paketi (telefon kulübesi, personel, çerçeve ve 360 Video Standı dahil) ise 18.000 TL. Sis makinesi, 360 video standı, kamera adam ve video tebrik kutusu gibi ek hizmetler için teklif alabilirsiniz.

Denizli'de sesli anı kayıt telefonu için tek adres Anı Kalsın Event — rezervasyon ve detaylı bilgi için bizimle iletişime geçin.`,
    },
  ];

  for (const post of blogPosts) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!exists) {
      await prisma.blogPost.create({ data: { ...post, isPublished: true, publishedAt: new Date() } });
    }
  }

  console.log("Seed tamamlandı.");
  console.log(`Admin giriş: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
