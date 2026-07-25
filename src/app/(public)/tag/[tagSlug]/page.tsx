// src/app/(public)/tag/[tagSlug]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tags, posts, users, categories, postTags } from "@/lib/schema";
import { eq, desc, and, getTableColumns } from "drizzle-orm";
import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import OptimizedImage from "@/components/public/OptimizedImage";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const tagRows = await db.select({ slug: tags.slug }).from(tags);
    return tagRows.map((tag) => ({ tagSlug: tag.slug }));
  } catch (error) {
    console.error("[SSG] Failed to generate tag params:", error);
    return [];
  }
}

interface TagPageProps {
  params: Promise<{
    tagSlug: string;
  }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tagSlug } = await params;

  let tag: any = null;
  try {
    const [tagRow] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);
    tag = tagRow || null;
  } catch (error) {
    console.error("[TagPage] Failed to fetch tag:", error);
    notFound();
  }

  if (!tag) notFound();

  let postList: any[] = [];
  try {
    const rawPosts = await db
      .select({
        ...getTableColumns(posts),
        authorName: users.name,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryColor: categories.color,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .innerJoin(postTags, eq(posts.id, postTags.postId))
      .where(and(eq(posts.status, "PUBLISHED"), eq(postTags.tagId, tag.id)))
      .orderBy(desc(posts.publishedAt))
      .limit(30);

    postList = rawPosts.map((row) => ({
      ...row,
      author: { name: row.authorName },
      category: { name: row.categoryName, slug: row.categorySlug, color: row.categoryColor },
    }));
  } catch (error) {
    console.error("[TagPage] Failed to fetch posts:", error);
  }

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
          {postList.length} {postList.length === 1 ? "article" : "articles"} tagged with &ldquo;{tag.name}&rdquo;
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {postList.map((post) => (
          <article key={post.id} className="flex flex-col group">
            <Link href={`/${post.category.slug}/${post.slug}`} className="block overflow-hidden mb-4 relative aspect-[3/2] bg-gray-100 rounded-sm">
              {post.featuredImage && (
                <OptimizedImage
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
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

        {postList.length === 0 && (
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
