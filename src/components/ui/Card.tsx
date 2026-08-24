export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-burgundy/10 bg-ivory shadow-sm shadow-burgundy/5 ${className}`}
      {...props}
    />
  );
}
