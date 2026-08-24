function VisaBadge() {
  return (
    <svg viewBox="0 0 48 30" width="44" height="28" role="img" aria-label="Visa">
      <rect width="48" height="30" rx="4" fill="#fff" stroke="#e2d9cf" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="13"
        fill="#1A1F71"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardBadge() {
  return (
    <svg viewBox="0 0 48 30" width="44" height="28" role="img" aria-label="Mastercard">
      <rect width="48" height="30" rx="4" fill="#fff" stroke="#e2d9cf" />
      <circle cx="20" cy="15" r="8.5" fill="#EB001B" />
      <circle cx="28" cy="15" r="8.5" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

function TroyBadge() {
  return (
    <svg viewBox="0 0 48 30" width="44" height="28" role="img" aria-label="Troy">
      <rect width="48" height="30" rx="4" fill="#fff" stroke="#e2d9cf" />
      <text x="24" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="12" fill="#B4122B">
        troy
      </text>
    </svg>
  );
}

/** Türkiye'de geçerli başlıca kart şemalarını sembolize eden küçük, sade rozetler. */
export default function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border border-burgundy/15 bg-ivory px-3 py-2 ${className}`}>
      <VisaBadge />
      <MastercardBadge />
      <TroyBadge />
    </div>
  );
}
