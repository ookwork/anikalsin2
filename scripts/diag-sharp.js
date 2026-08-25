const path = require("path");
const fs = require("fs");

console.log("platform:", process.platform, "arch:", process.arch, "node:", process.version);

const standaloneSharpPath = path.join(__dirname, "..", ".next", "standalone", "node_modules", "sharp");
console.log("standalone sharp yolu var mi:", fs.existsSync(standaloneSharpPath), standaloneSharpPath);

let sharp;
try {
  sharp = require(standaloneSharpPath);
  console.log("standalone sharp require OK, version:", sharp.versions);
} catch (err) {
  console.log("standalone sharp require HATASI:", err.message);
  console.log(err.stack);
  process.exit(1);
}

const imgPath = path.join(__dirname, "..", "public", "uploads", "seed-telefon-pembe.webp");
console.log("test dosyası var mi:", fs.existsSync(imgPath), imgPath);

sharp(imgPath)
  .resize(400, 400, { fit: "inside" })
  .webp({ quality: 75 })
  .toBuffer()
  .then((buf) => {
    console.log("sharp islem BASARILI, cikti boyutu:", buf.length, "bayt");
  })
  .catch((err) => {
    console.log("sharp islem HATASI:", err.message);
    console.log(err.stack);
    process.exit(1);
  });
