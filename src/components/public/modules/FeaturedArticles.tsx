// src/components/public/modules/FeaturedArticles.tsx
import Link from "next/link";
import { Calendar, Flame } from "lucide-react";

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

interface FeaturedArticlesProps {
  title?: string;
  featuredPosts: Post[];
  trendingPosts: Post[];
}

export default function FeaturedArticles({
  title = "Featured & Trending",
  featuredPosts,
  trendingPosts,
}: FeaturedArticlesProps) {
  const mainFeatured = featuredPosts[0];
  const sideFeatured = featuredPosts.slice(1, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-2 mb-10 border-b border-border-subtle pb-4">
        <h2 className="font-serif font-black text-2xl tracking-tight text-text-primary">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Large Main Feature & Secondary list (Column Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {mainFeatured && (
            <div className="group flex flex-col md:flex-row gap-6 items-start hover:shadow-lg transition-shadow duration-300 p-2 -m-2 rounded-lg">
              {mainFeatured.featuredImage && (
                <Link
                  href={`/${mainFeatured.category.slug}/${mainFeatured.slug}`}
                  className="w-full md:w-1/2 aspect-[3/2] overflow-hidden bg-bg-light rounded-sm relative block"
                >
                  <img
                    src={mainFeatured.featuredImage}
                    alt={mainFeatured.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              )}
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                <Link
                  href={`/${mainFeatured.category.slug}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-primary"
                >
                  {mainFeatured.category.name}
                </Link>
                
                <h3 className="font-serif font-black text-xl sm:text-2xl tracking-tight text-text-primary leading-snug group-hover:text-brand-primary transition-colors">
                  <Link href={`/${mainFeatured.category.slug}/${mainFeatured.slug}`}>
                    {mainFeatured.title}
                  </Link>
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                  {mainFeatured.excerpt || mainFeatured.subtitle}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {mainFeatured.publishedAt ? new Date(mainFeatured.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Grid (Side Features) */}
          {sideFeatured.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-border-subtle">
              {sideFeatured.map((post) => (
                <div key={post.id} className="group flex flex-col gap-3">
                  {post.featuredImage && (
                    <Link
                      href={`/${post.category.slug}/${post.slug}`}
                      className="aspect-[16/10] overflow-hidden bg-bg-light rounded-sm"
                    >
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  )}
                  <Link
                    href={`/${post.category.slug}`}
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-primary"
                  >
                    {post.category.name}
                  </Link>
                  <h4 className="font-serif font-bold text-base tracking-tight text-text-primary leading-snug group-hover:text-brand-primary transition-colors">
                    <Link href={`/${post.category.slug}/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h4>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Trending Feed (Column Span 4) */}
        <div className="lg:col-span-4 bg-bg-light/60 border border-border-subtle p-6 rounded-md flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Flame className="w-5 h-5 text-brand-primary" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary">
              Trending Stories
            </h3>
          </div>

          <div className="divide-y divide-border-subtle flex flex-col">
            {trendingPosts.map((post, idx) => (
              <div key={post.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 group">
                <span className="font-serif font-black text-3xl text-gray-200 group-hover:text-brand-primary/20 shrink-0 select-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <Link
                    href={`/${post.category.slug}`}
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-primary"
                  >
                    {post.category.name}
                  </Link>
                  <h4 className="font-bold text-xs leading-snug text-text-primary group-hover:text-brand-primary transition-colors">
                    <Link href={`/${post.category.slug}/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
