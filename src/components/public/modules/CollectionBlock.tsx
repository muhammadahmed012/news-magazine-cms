// src/components/public/modules/CollectionBlock.tsx
import Link from "next/link";
import { Calendar, TrendingUp } from "lucide-react";

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  readingTime: number;
  viewCount?: number;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string; color: string | null };
}

interface CollectionBlockProps {
  title: string;
  posts: Post[];
  trendingPosts?: Post[];
}

export default function CollectionBlock({
  title,
  posts,
  trendingPosts = [],
}: CollectionBlockProps) {
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 5);

  function formatDate(date: Date | string | null): string {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-subtle">
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-border-subtle">
        <h2 className="font-serif font-black text-2xl tracking-tight text-text-primary">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {/* Featured Post */}
          {mainPost && (
            <article className="group mb-8">
              <Link href={`/${mainPost.category.slug}/${mainPost.slug}`} className="block overflow-hidden rounded-md relative">
                {mainPost.featuredImage ? (
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <img
                      src={mainPost.featuredImage}
                      alt={mainPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gray-100" />
                )}
              </Link>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href={`/${mainPost.category.slug}`}>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                      {mainPost.category.name}
                    </span>
                  </Link>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Calendar className="w-3 h-3" /> {formatDate(mainPost.publishedAt)}
                  </span>
                </div>
                <Link href={`/${mainPost.category.slug}/${mainPost.slug}`} className="group">
                  <h3 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-text-primary group-hover:text-brand-primary transition-colors">
                    {mainPost.title}
                  </h3>
                </Link>
                {mainPost.excerpt && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mt-1">
                    {mainPost.excerpt}
                  </p>
                )}
              </div>
            </article>
          )}

          {/* Side Posts Grid */}
          {sidePosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border-subtle pt-8">
              {sidePosts.map((post) => (
                <article key={post.id} className="group flex gap-4">
                  <Link href={`/${post.category.slug}/${post.slug}`} className="shrink-0 w-24 h-24 overflow-hidden rounded-md block">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </Link>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Link href={`/${post.category.slug}`}>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {post.category.name}
                      </span>
                    </Link>
                    <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                      <h4 className="font-serif font-bold text-sm leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-auto">
                      <Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4">
          {/* Trending */}
          {trendingPosts.length > 0 && (
            <div className="bg-bg-light/60 border border-border-subtle p-6 rounded-md">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary">
                  Trending
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-border-subtle">
                {trendingPosts.slice(0, 6).map((post, idx) => (
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
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}
                      </span>
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
