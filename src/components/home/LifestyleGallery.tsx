import Image from "next/image";

export default function LifestyleGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Gerçek Anlar</p>
        <h2 className="mt-2 text-3xl font-semibold text-burgundy-dark sm:text-4xl">Düğünlerden Kareler</h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((img, i) => (
          <div
            key={img}
            className={`relative overflow-hidden rounded-2xl bg-rose-pale ${
              i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"
            }`}
          >
            <Image
              src={img}
              alt="Anikalsin anı kayıt telefonu düğün karesi"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
