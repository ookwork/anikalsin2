// cPanel "Run JS script" ile çalıştırılmak üzere hazırlanmış tek seferlik dağıtım yardımcısı.
// Sırasıyla: build -> prisma migrate deploy -> admin kullanıcı seed.
// Uygulama kökünde (Application root) çalıştırılmalıdır.
const { execSync } = require("child_process");
const path = require("path");

const cwd = __dirname;

function run(label, command) {
  console.log(`\n=== ${label} ===`);
  try {
    execSync(command, { cwd, stdio: "inherit", env: process.env });
    console.log(`=== ${label}: OK ===`);
  } catch (err) {
    console.error(`=== ${label}: HATA ===`);
    console.error(err.message);
    process.exit(1);
  }
}

run("Build (next build)", "npm run build");
run("Prisma migrate deploy", "npx prisma migrate deploy");
run("Admin kullanıcı seed", "npm run db:seed");

console.log("\nTüm adımlar tamamlandı.");
