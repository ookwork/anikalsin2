// `next build` ile "standalone" çıktı modu, statik dosyaları ve public/ klasörünü kendiliğinden
// kopyalamaz (bkz. Next.js dokümantasyonu). Bu script, cPanel/Passenger gibi tek-dosya (server.js)
// bekleyen Node.js hostlarına deploy edebilmek için bu eksik kopyalamayı otomatikleştirir.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error('.next/standalone bulunamadı - next.config.ts içinde output: "standalone" ayarlı mı kontrol edin.');
  process.exit(1);
}

fs.cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), { recursive: true });

console.log("public/ ve .next/static, .next/standalone içine kopyalandı.");
