// src/components/public/sections/CollectionSection.tsx
import { getSectionPosts, getSidebarPosts, getTrendingPosts } from "@/lib/queries";
import OptimizedImage from "@/components/public/OptimizedImage";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface Props {
  title?: string;
  postsCount?: number;
  categorySlug?: string;
  sidebarType?: "trending" | "latest" | "category";
}

export default async function CollectionSection({
  title = "Collection",
  postsCount = 5,
  categorySlug,
  sidebarType = "trending",
}: Props) {
  const [posts, globalTrending] = await Promise.all([
    getSectionPosts("collection", postsCount, categorySlug),
    getTrendingPosts(6),
  ]);

  const sidebarPosts = await getSidebarPosts(sidebarType, globalTrending, categorySlug);

  if (posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-subtle">
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-border-subtle">
        <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8">
          {posts[0] && (
            <article className="group mb-8">
              <Link href={`/${posts[0].category.slug}/${posts[0].slug}`} className="block overflow-hidden rounded-md relative">
                {posts[0].featuredImage ? (
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <OptimizedImage
                      src={posts[0].featuredImage}
                      alt={posts[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gray-100" />
                )}
              </Link>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href={`/${posts[0].category.slug}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white" style={{ backgroundColor: "var(--brand-primary)" }}>
                      {posts[0].category.name}
                    </span>
                  </Link>
                  <span className="text-[10px] font-bold text-gray-400">{posts[0].publishedAt ? new Date(posts[0].publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                </div>
                <Link href={`/${posts[0].category.slug}/${posts[0].slug}`} className="group">
                  <h4 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-text-primary group-hover:text-brand-primary transition-colors">
                    {posts[0].title}
                  </h4>
                </Link>
              </div>
            </article>
          )}
          {posts.slice(1, 5).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border-subtle pt-8">
              {posts.slice(1, 5).map((post: any) => (
                <article key={post.id} className="group flex gap-4">
                  <Link href={`/${post.category.slug}/${post.slug}`} className="shrink-0 w-24 h-24 overflow-hidden rounded-md block">
                    {post.featuredImage ? (
                      <OptimizedImage
                        src={post.featuredImage}
                        alt={post.title}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </Link>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Link href={`/${post.category.slug}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--brand-primary)" }}>
                        {post.category.name}
                      </span>
                    </Link>
                    <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                      <h4 className="font-serif font-bold text-sm leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] font-bold text-gray-400 mt-auto">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside className="lg:col-span-4">
          {sidebarPosts && sidebarPosts.length > 0 && (
            <div className="bg-bg-light/60 border border-border-subtle p-6 rounded-md">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary">
                  {sidebarType === "latest" ? "Latest" : sidebarType === "category" ? "Related" : "Trending"}
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-border-subtle">
                {sidebarPosts.slice(0, 6).map((post: any, idx: number) => (
                  <article key={post.id} className="flex gap-3 py-3 first:pt-0 last:pb-0 group">
                    <span className="font-sans font-black text-xl text-gray-200 group-hover:text-brand-primary/30 shrink-0 select-none w-6 text-center">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                        <h4 className="font-bold text-xs leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>
                      <span className="text-[10px] font-bold text-gray-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
