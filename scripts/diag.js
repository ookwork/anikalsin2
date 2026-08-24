const fs = require("fs");
const path = require("path");

console.log("platform:", process.platform, "arch:", process.arch);
console.log("node:", process.version);

const swcDir = path.join(__dirname, "..", "node_modules", "@next");
try {
  const entries = fs.readdirSync(swcDir).filter((e) => e.startsWith("swc-"));
  console.log("@next/swc-* klasörleri:", entries);
} catch (err) {
  console.log("node_modules/@next okunamadı:", err.message);
}

try {
  const loadBindings = require("next/dist/build/swc/index.js");
  console.log("next/dist/build/swc/index.js require edildi, tip:", typeof loadBindings);
} catch (err) {
  console.log("require next/dist/build/swc HATA:", err.message);
}

try {
  process.env.NEXT_SWC_DEBUG = "1";
  const swc = require("next/dist/build/swc");
  swc.loadBindings().then(
    () => console.log("loadBindings() BAŞARILI - native binding yüklendi"),
    (err) => console.log("loadBindings() HATA:", err && err.message)
  );
} catch (err) {
  console.log("loadBindings genel HATA:", err.message);
}
