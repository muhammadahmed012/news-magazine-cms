// src/components/public/sections/HeroSection.tsx
import { getHeroPosts } from "@/lib/queries";
import OptimizedImage from "@/components/public/OptimizedImage";
import Link from "next/link";

export default async function HeroSection() {
  const posts = await getHeroPosts();
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 mb-8">
      {mainPost && (
        <div className="lg:col-span-7 group relative overflow-hidden bg-black min-h-[400px] lg:min-h-[500px]">
          <Link href={`/${mainPost.category.slug}/${mainPost.slug}`} className="absolute inset-0">
            {mainPost.featuredImage && (
              <OptimizedImage
                src={mainPost.featuredImage}
                alt={mainPost.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </Link>

          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white">
            <Link href={`/${mainPost.category.slug}`}>
              <span className="inline-block text-[11px] font-black uppercase tracking-widest mb-3 px-2 py-1 text-white bg-brand-primary">
                {mainPost.category.name}
              </span>
            </Link>
            <Link href={`/${mainPost.category.slug}/${mainPost.slug}`}>
              <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] mb-3 group-hover:text-gray-200 transition-colors">
                {mainPost.title}
              </h1>
            </Link>
            {mainPost.excerpt && (
              <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed line-clamp-2 max-w-2xl hidden sm:block mb-4">
                {mainPost.excerpt}
              </p>
            )}
            {mainPost.publishedAt && (
              <span className="text-[11px] font-semibold text-gray-400">
                {new Date(mainPost.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      )}

      {secondaryPosts.length > 0 && (
        <div className="lg:col-span-5 grid grid-cols-2 gap-1 bg-white">
          {secondaryPosts.map((post) => (
            <article key={post.id} className="group relative overflow-hidden bg-gray-100 min-h-[200px] lg:min-h-[248px]">
              <Link href={`/${post.category.slug}/${post.slug}`} className="absolute inset-0">
                {post.featuredImage && (
                  <OptimizedImage
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-95"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </Link>
              <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                <Link href={`/${post.category.slug}`}>
                  <span className="inline-block text-[9px] font-black uppercase tracking-widest mb-2 px-1.5 py-0.5 bg-brand-primary">
                    {post.category.name}
                  </span>
                </Link>
                <Link href={`/${post.category.slug}/${post.slug}`}>
                  <h2 className="font-serif font-black text-sm sm:text-base leading-snug group-hover:text-gray-200 transition-colors line-clamp-3">
                    {post.title}
                  </h2>
                </Link>
                {post.publishedAt && (
                  <span className="text-[10px] font-semibold text-gray-400 mt-1.5 block">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
