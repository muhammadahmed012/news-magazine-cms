// src/components/public/sections/LatestNewsSection.tsx
import { getSectionPosts } from "@/lib/queries";
import OptimizedImage from "@/components/public/OptimizedImage";
import Link from "next/link";

interface Props {
  title?: string;
  postsCount?: number;
  categorySlug?: string;
}

export default async function LatestNewsSection({
  title = "Latest News",
  postsCount = 4,
  categorySlug,
}: Props) {
  const posts = await getSectionPosts("latest", postsCount, categorySlug);
  if (posts.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between border-b border-black mb-6">
        <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link href={`/${post.category.slug}/${post.slug}`} className="block overflow-hidden relative">
              {post.featuredImage ? (
                <div className="relative overflow-hidden aspect-[16/10]">
                  <OptimizedImage
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[16/10] bg-gray-100" />
              )}
            </Link>
            <div className="p-4 flex flex-col flex-1 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/${post.category.slug}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white" style={{ backgroundColor: "var(--brand-primary)" }}>
                    {post.category.name}
                  </span>
                </Link>
                <span className="text-[9px] font-bold text-gray-400">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
              </div>
              <Link href={`/${post.category.slug}/${post.slug}`} className="group mt-1">
                <h3 className="font-serif font-bold text-[19px] leading-[1.2] text-gray-900 group-hover:text-brand-primary transition-colors">
                  {post.title}
                </h3>
              </Link>
              {post.excerpt && (
                <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2 mt-auto">
                  {post.excerpt}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
