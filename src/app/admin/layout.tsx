// Admin paneli, ziyaretçi sitesinde seçilen temadan bağımsız olarak her zaman
// klasik renk paletinde kalır (tutarlı/okunabilir bir yönetim aracı olması için).
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="classic">{children}</div>;
}
