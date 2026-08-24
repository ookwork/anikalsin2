function getEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export default function ProductVideo({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="mt-8 aspect-video w-full overflow-hidden rounded-3xl bg-charcoal/5">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Ürün videosu"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={url} controls className="h-full w-full" />
      )}
    </div>
  );
}
