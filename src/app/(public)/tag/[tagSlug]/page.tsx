// src/app/(public)/tag/[tagSlug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Clock, Tag } from "lucide-react";

export const revalidate = 300;

interface TagPageProps {
  params: Promise<{
    tagSlug: string;
  }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tagSlug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
  });

  if (!tag) notFound();

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { id: tag.id } },
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true, color: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Tag Header */}
      <div className="border-b border-border-subtle pb-8 mb-10">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <span>/</span>
          <span className="text-brand-primary">Tags</span>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="w-8 h-8 text-brand-primary" />
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-text-primary tracking-tight">
            {tag.name}
          </h1>
        </div>
        <p className="mt-3 text-sm text-gray-400 font-semibold">
          {posts.length} {posts.length === 1 ? "article" : "articles"} tagged with &ldquo;{tag.name}&rdquo;
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col group">
            <Link href={`/${post.category.slug}/${post.slug}`} className="block overflow-hidden mb-4 relative aspect-[3/2] bg-gray-100 rounded-sm">
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              )}
            </Link>
            <div className="flex flex-col flex-1">
              <Link href={`/${post.category.slug}/${post.slug}`}>
                <span
                  className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block mb-2"
                  style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                >
                  {post.category.name}
                </span>
              </Link>
              <Link href={`/${post.category.slug}/${post.slug}`}>
                <h2 className="font-serif font-bold text-xl leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-3">
                  {post.title}
                </h2>
              </Link>
              {post.excerpt && (
                <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-auto pt-4 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                <span className="text-gray-600">{post.author?.name}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <Tag className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-text-primary">No articles with this tag</h3>
            <p className="text-sm text-gray-500 mt-1">Check back soon for new content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
