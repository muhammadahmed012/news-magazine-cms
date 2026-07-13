// src/components/public/modules/LatestNews.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { getPosts } from "@/actions/posts";
import { RefreshCw, Calendar } from "lucide-react";

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

interface LatestNewsProps {
  title?: string;
  initialPosts: Post[];
  limit?: number;
}

export default function LatestNews({
  title = "Latest Stories",
  initialPosts,
  limit = 6,
}: LatestNewsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [offset, setOffset] = useState(limit);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= limit);

  const handleLoadMore = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await getPosts({ limit, offset });
      if (response.success && response.posts.length > 0) {
        // Cast or adapt standard Prisma output to Post type safely
        const newPosts = response.posts as unknown as Post[];
        setPosts((prev) => [...prev, ...newPosts]);
        setOffset((prev) => prev + limit);
        if (newPosts.length < limit) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-subtle">
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-border-subtle">
        <h2 className="font-serif font-black text-2xl tracking-tight text-text-primary">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          const dateStr = post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "";

          return (
            <article key={post.id} className="group flex flex-col bg-white border border-border-subtle rounded-md overflow-hidden hover:shadow-lg transition-all duration-300">
              {post.featuredImage && (
                <Link
                  href={`/${post.category.slug}/${post.slug}`}
                  className="block overflow-hidden bg-bg-light relative"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span
                    className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 text-white"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    {post.category.name}
                  </span>
                </Link>
              )}
              
              <div className="p-5 flex flex-col flex-1 gap-2">
                <h3 className="font-serif font-black text-lg text-text-primary leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                  <Link href={`/${post.category.slug}/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-2 font-medium">
                  {post.excerpt || post.subtitle}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold border-t border-border-subtle pt-3 mt-auto shrink-0">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-md text-xs font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
              </>
            ) : (
              "Load More Stories"
            )}
          </button>
        </div>
      )}
    </section>
  );
}
