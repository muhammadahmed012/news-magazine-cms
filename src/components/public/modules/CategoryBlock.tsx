// src/components/public/modules/CategoryBlock.tsx
import Link from "next/link";
import { Calendar } from "lucide-react";

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  readingTime: number;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string; color: string | null };
}

interface CategoryBlockProps {
  title: string;
  categorySlug: string;
  posts: Post[];
  layout?: "grid" | "row";
}

export default function CategoryBlock({
  title,
  categorySlug,
  posts,
  layout = "grid",
}: CategoryBlockProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-subtle">
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-border-subtle">
        <h2 className="font-serif font-black text-2xl tracking-tight text-text-primary">
          {title}
        </h2>
        <Link
          href={`/${categorySlug}`}
          className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-wider"
        >
          View All
        </Link>
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="group flex flex-col gap-3 hover:shadow-lg transition-shadow duration-300 p-2 -m-2 rounded-lg">
              {post.featuredImage && (
                <Link
                  href={`/${post.category.slug}/${post.slug}`}
                  className="aspect-[16/10] overflow-hidden bg-bg-light rounded-sm block relative"
                >
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              )}
              <h3 className="font-serif font-bold text-base leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                <Link href={`/${post.category.slug}/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {post.excerpt || post.subtitle}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="group flex gap-4 sm:gap-6 items-start pb-6 border-b border-border-subtle last:border-b-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 transition-colors rounded">
              {post.featuredImage && (
                <Link
                  href={`/${post.category.slug}/${post.slug}`}
                  className="w-24 sm:w-32 aspect-[4/3] overflow-hidden bg-bg-light rounded-sm shrink-0 block"
                >
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              )}
              <div className="flex flex-col gap-1.5">
                <h3 className="font-serif font-bold text-base leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                  <Link href={`/${post.category.slug}/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed hidden sm:block">
                  {post.excerpt || post.subtitle}
                </p>
                <span className="text-[10px] text-gray-400 font-bold">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
