/**
 * anikalsin.com.tr eski sitesinde bu 3 yazı blog altında değil, kök dizinde
 * (örn. /anı-kayıt-telefonu) yayınlanıyordu. Google'ın aynı adreslerden içeriği
 * bulmaya devam etmesi için yeni sitede de aynı kök yollarda sunuluyor;
 * /blog/{slug} adresine gelen istekler bu yollara 301 ile yönlendirilir
 * (bkz. next.config.ts ve src/app/blog/page.tsx).
 */
export const LEGACY_BLOG_ROOT_ROUTES: Record<string, string> = {
  "ani-kayit-telefonu-nedir": "/anı-kayıt-telefonu",
  "retro-news-gazete-booth": "/retronews-gazetebooth",
  "denizli-ani-telefonu-kiralama": "/denizli-anı-telefonu",
};

/**
 * Next.js/Turbopack'in dev modunda Türkçe karakterli (ı/İ) klasör adlarını App
 * Router sayfası olarak derlemediği tespit edildi (dosya diskte doğru halde
 * olmasına rağmen route hiç oluşmuyor). Bu yüzden bu 2 sayfa ASCII klasör
 * adlarıyla (src/app/legacy-...) yazıldı ve next.config.ts'teki rewrites()
 * ile gerçek (Türkçe karakterli) genel adrese bağlanıyor. rewrites tarayıcıda
 * URL'i değiştirmez, sadece Next.js'in içeride hangi sayfayı render edeceğini
 * belirler — Google ve ziyaretçiler için adres hep Türkçe karakterli kalır.
 * "retronews-gazetebooth" tamamen ASCII olduğu için bu soruna takılmıyor,
 * doğrudan kendi klasöründen çalışıyor.
 */
export const LEGACY_BLOG_REWRITES: Record<string, string> = {
  [encodeURI("/anı-kayıt-telefonu")]: "/legacy-ani-kayit-telefonu",
  [encodeURI("/denizli-anı-telefonu")]: "/legacy-denizli-ani-telefonu",
};
