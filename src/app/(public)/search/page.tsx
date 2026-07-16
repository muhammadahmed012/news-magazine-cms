// src/app/(public)/search/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Calendar, Search } from "lucide-react";
import OptimizedImage from "@/components/public/OptimizedImage";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  // 1. Fetch matching posts if a query exists
  let posts: any[] = [];
  if (query.trim()) {
    posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { subtitle: { contains: query } },
          { excerpt: { contains: query } },
          { content: { contains: query } },
        ],
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="border-b border-border-subtle pb-8 mb-10">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-text-primary tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-brand-primary" /> Search Results
        </h1>
        <p className="text-xs font-bold text-gray-400 mt-2">
          {query.trim()
            ? `Found ${posts.length} articles matching "${query}"`
            : "Enter a search query to browse our article archives."}
        </p>
      </div>

      {/* Form override if user wants to search from here */}
      <div className="max-w-xl mb-12">
        <form action="/search" method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search articles, topics, and authors..."
            className="w-full text-xs font-semibold px-4 py-3 bg-white border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
          />
          <button
            type="submit"
            className="bg-brand-primary text-white hover:bg-brand-hover px-5 py-3 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-bg-light border border-border-subtle rounded-md">
          <p className="text-sm font-semibold text-gray-500">
            {query.trim() ? "No articles matched your query. Try different keywords." : "Waiting for your search query."}
          </p>
        </div>
      ) : (
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
              <article key={post.id} className="group flex flex-col bg-white border border-border-subtle rounded-md overflow-hidden hover:shadow-md transition-all duration-300">
                {post.featuredImage && (
                  <Link
                    href={`/${post.category.slug}/${post.slug}`}
                    className="aspect-[16/9] overflow-hidden bg-bg-light block"
                  >
                    <OptimizedImage
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                )}
                
                <div className="p-6 flex flex-col flex-grow gap-3">
                  <Link
                    href={`/${post.category.slug}`}
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-primary self-start"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {post.category.name}
                  </Link>

                  <h2 className="font-serif font-black text-lg text-text-primary leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                    <Link href={`/${post.category.slug}/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 font-medium">
                    {post.excerpt || post.subtitle}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-t border-border-subtle pt-4 mt-auto">
                    <span className="truncate max-w-[120px]">By {post.author.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
