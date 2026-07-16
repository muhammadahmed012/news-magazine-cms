// src/components/public/AdBanner.tsx
import { getAdByPlacement } from "@/lib/queries";

interface AdBannerProps {
  placement: string;
  className?: string;
}

function AdContent({ ad }: { ad: any }) {
  if (ad.type === "HTML" && ad.code) {
    return (
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: ad.code }}
      />
    );
  }

  if (ad.type === "IMAGE" && ad.imageUrl) {
    return (
      <div className="text-center">
        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-300 block mb-1">Advertisement</span>
        {ad.targetUrl ? (
          <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img src={ad.imageUrl} alt={ad.title} className="max-w-full h-auto mx-auto rounded" loading="lazy" />
          </a>
        ) : (
          <img src={ad.imageUrl} alt={ad.title} className="max-w-full h-auto mx-auto rounded" loading="lazy" />
        )}
      </div>
    );
  }

  return null;
}

export default async function AdBanner({ placement, className = "" }: AdBannerProps) {
  const ad = await getAdByPlacement(placement);
  if (!ad) return null;

  return (
    <div className={`ad-banner ${className}`} data-ad-id={ad.id}>
      <AdContent ad={ad} />
    </div>
  );
}
