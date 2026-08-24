interface Stat {
  value: string;
  label: string;
}

export default function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-burgundy-dark">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center sm:grid-cols-4 sm:px-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-heading text-3xl font-semibold text-gold-light sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-rose-pale/80 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
