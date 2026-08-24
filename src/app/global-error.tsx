"use client";

// Next.js'in kök layout dışında (layout.tsx'teki provider'lara erişemeden) render ettiği global hata sınırı.
// Bilinçli olarak sade tutulur: herhangi bir context/provider'a bağımlı değildir
// (bkz. https://github.com/vercel/next.js/issues/86178 - prerender sırasında useContext null hatası).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#401d29" }}>Bir şeyler ters gitti</h1>
        <p style={{ marginTop: "0.75rem", color: "#2e2620" }}>
          Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1.5rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            background: "#5c2a3a",
            color: "#fffdf9",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Tekrar Dene
        </button>
      </body>
    </html>
  );
}
