// src/components/public/sections/FeaturedSection.tsx
import { getSectionPosts, getTrendingPosts } from "@/lib/queries";
import OptimizedImage from "@/components/public/OptimizedImage";
import Link from "next/link";

interface Props {
  title?: string;
  postsCount?: number;
  categorySlug?: string;
}

export default async function FeaturedSection({
  title = "In Case You Missed It",
  postsCount = 4,
  categorySlug,
}: Props) {
  const [posts, trending] = await Promise.all([
    getSectionPosts("featured", postsCount, categorySlug, true),
    getTrendingPosts(6),
  ]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
      {trending.length > 0 && (
        <div className="lg:col-span-4">
          <div className="border-b border-black mb-5">
            <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
              Top Trending
            </h3>
          </div>
          <div className="flex flex-col divide-y divide-gray-200">
            {trending.map((post, idx) => (
              <article key={post.id} className="flex gap-4 py-4 first:pt-0 group hover:bg-gray-50 -mx-2 px-2 transition-colors rounded">
                <span className="font-sans font-black text-[32px] text-gray-200 leading-none w-8 shrink-0 select-none mt-1 group-hover:text-brand-primary/30 transition-colors">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Link href={`/${post.category.slug}`}>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary hover:underline">
                      {post.category.name}
                    </span>
                  </Link>
                  <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                    <h4 className="font-serif font-bold text-[17px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors">
                      {post.title}
                    </h4>
                  </Link>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="lg:col-span-8">
        <div className="border-b border-black mb-5">
          <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
            {title}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="group flex flex-col sm:flex-row gap-4 hover:bg-gray-50 p-2 -m-2 transition-colors rounded">
              {post.featuredImage && (
                <Link href={`/${post.category.slug}/${post.slug}`} className="shrink-0 w-full sm:w-32 h-48 sm:h-24 overflow-hidden block relative rounded-sm">
                  <OptimizedImage
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 128px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              )}
              <div className="flex flex-col min-w-0">
                <Link href={`/${post.category.slug}`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary mb-1 block hover:underline">
                    {post.category.name}
                  </span>
                </Link>
                <Link href={`/${post.category.slug}/${post.slug}`} className="group mb-1.5">
                  <h3 className="font-serif font-bold text-[17px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <span className="text-[10px] font-bold text-gray-400 mt-auto pt-1">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
