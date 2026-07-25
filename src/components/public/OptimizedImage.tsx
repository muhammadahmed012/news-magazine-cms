// src/components/public/OptimizedImage.tsx
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fetchPriority = "auto",
  fill = false,
  sizes,
  style,
}: OptimizedImageProps) {
  if (!src) return null;

  const isExternal =
    src.startsWith("http://") ||
    src.startsWith("https://");

  const resolvedFetchPriority = priority ? "high" : fetchPriority;

  if (!isExternal) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={resolvedFetchPriority}
        decoding="async"
      />
    );
  }

  const quality = priority ? 80 : 75;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        fetchPriority={resolvedFetchPriority}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        style={style}
        quality={quality}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 450}
      className={className}
      priority={priority}
      fetchPriority={resolvedFetchPriority}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      style={style}
      quality={quality}
    />
  );
}
