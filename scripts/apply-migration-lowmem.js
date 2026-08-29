// Prisma CLI'nin WASM motoru bu sunucuda bellek yetersizliğinden çalışmıyor
// (RangeError: WebAssembly.Instance(): Out of memory). Bu script tüm bekleyen
// migration'ları Prisma motorunu hiç kullanmadan, doğrudan better-sqlite3 ile uygular ve
// _prisma_migrations tablosuna Prisma'nın kendi formatında birer kayıt ekler ki
// ileride tekrar "prisma migrate deploy" çalıştırılabilirse bunları zaten uygulanmış olarak
// görsün. prisma/migrations/ altına yeni bir migration klasörü eklendiğinde bu script
// değiştirilmeden tekrar çalıştırılabilir — hangi migration'ların eksik olduğunu kendisi bulur.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Module = require("module");

// "bindings" paketi, doğru derlenmiş better_sqlite3.node dosyasını bulmak için çağıranın dosya
// yolundan yola çıkarak dizin yukarı tarama yapıyor; bu sunucudaki iç içe symlink yapısı yüzünden
// bu tarama yanlış (bozuk) bir kopyaya çıkıyor. Doğru dosyanın tam yerini zaten bildiğimiz için,
// "bindings" çağrısını global olarak yakalayıp doğrudan bu dosyayı döndürüyoruz.
const nodeAddonPath = path.join(
  __dirname,
  "..",
  ".next",
  "standalone",
  "node_modules",
  "better-sqlite3",
  "build",
  "Release",
  "better_sqlite3.node"
);
if (!fs.existsSync(nodeAddonPath)) {
  console.error("HATA: better_sqlite3.node bulunamadi:", nodeAddonPath);
  process.exit(1);
}
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === "bindings") {
    return function () {
      return originalRequire.call(this, nodeAddonPath);
    };
  }
  return originalRequire.apply(this, arguments);
};

const Database = require(path.join(__dirname, "..", ".next", "standalone", "node_modules", "better-sqlite3"));

const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const dbFile = dbUrl.replace(/^file:/, "");
const dbPath = path.resolve(process.cwd(), dbFile);

console.log("Veritabani dosyasi:", dbPath);
if (!fs.existsSync(dbPath)) {
  console.error("HATA: Veritabani dosyasi bulunamadi:", dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

const migrationNames = fs
  .readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let appliedCount = 0;

for (const migrationName of migrationNames) {
  const sqlPath = path.join(migrationsDir, migrationName, "migration.sql");
  if (!fs.existsSync(sqlPath)) continue;

  const already = db.prepare("SELECT 1 FROM _prisma_migrations WHERE migration_name = ?").get(migrationName);
  if (already) {
    console.log("Zaten uygulanmis, atlaniyor:", migrationName);
    continue;
  }

  const sqlBuffer = fs.readFileSync(sqlPath);
  const sql = sqlBuffer.toString("utf8");
  const checksum = crypto.createHash("sha256").update(sqlBuffer).digest("hex");

  const applyAndRecord = db.transaction(() => {
    db.exec(sql);
    db.prepare(
      `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, 1)`
    ).run(crypto.randomUUID(), checksum, Date.now(), migrationName, Date.now());
  });

  applyAndRecord();
  console.log("Migration basariyla uygulandi:", migrationName);
  appliedCount++;
}

if (appliedCount === 0) {
  console.log("Uygulanacak yeni migration yok.");
}

db.close();
