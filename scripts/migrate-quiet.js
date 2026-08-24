const { execSync } = require("child_process");

try {
  execSync("npx prisma migrate deploy", { cwd: __dirname + "/..", encoding: "utf8" });
  console.log("migrate deploy OK");
} catch (err) {
  const tail = (s) => (s ? s.toString().slice(-1500) : "(yok)");
  console.log("=== MIGRATE HATA (son 1500 karakter) ===");
  console.log("--- stdout tail ---");
  console.log(tail(err.stdout));
  console.log("--- stderr tail ---");
  console.log(tail(err.stderr));
  process.exit(1);
}
