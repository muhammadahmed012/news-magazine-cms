// src/app/(public)/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPosts } from "@/actions/posts";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { generatePageSchema, generatePageBreadcrumbSchema } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  const pages = await prisma.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return [...categories, ...pages].map((item) => ({ slug: item.slug }));
}

const POSTS_PER_PAGE = 12;

interface SlugPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (category) {
    return {
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description || undefined,
    };
  }

  const page = await prisma.page.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
  if (page) {
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || undefined,
      alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
      robots: page.robotsMeta || undefined,
    };
  }

  return {};
}

export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);

  // 1. Try to find a category first
  const category = await prisma.category.findUnique({
    where: { slug: slug },
    include: {
      children: true,
      parent: true,
    },
  });

  if (category) {
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    const { posts } = await getPosts({ categorySlug: slug, limit: POSTS_PER_PAGE, offset });
    const layout = category.layoutStyle || "grid";

    const totalCount = await prisma.post.count({
      where: {
        status: "PUBLISHED",
        category: {
          OR: [
            { slug: slug },
            { parent: { slug: slug } }
          ]
        }
      }
    });
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    const buildPageUrl = (page: number) => {
      if (page <= 1) return `/${slug}`;
      return `/${slug}?page=${page}`;
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <div className="border-b border-border-subtle pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400">
              <Link href="/" className="hover:text-brand-primary">Home</Link>
              {category.parent && (
                <>
                  <span>/</span>
                  <Link href={`/${category.parent.slug}`} className="hover:text-brand-primary">
                    {category.parent.name}
                  </Link>
                </>
              )}
            </div>
            <h1 className="font-serif font-black text-4xl sm:text-5xl text-text-primary tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-4 text-gray-500 font-medium leading-relaxed max-w-2xl text-lg">
                {category.description}
              </p>
            )}
          </div>
          {category.children.length > 0 && (
            <div className="flex gap-2 flex-wrap md:justify-end max-w-sm">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/${child.slug}`}
                  className="px-3 py-1.5 bg-bg-light hover:bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-sm border border-border-subtle transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col group">
              <Link href={`/${slug}/${post.slug}`} className="block overflow-hidden mb-4 relative aspect-[3/2] bg-gray-100 rounded-sm">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                )}
                {post.isFeatured && (
                  <div className="absolute top-2 right-2 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                    Featured
                  </div>
                )}
              </Link>
              <div className="flex flex-col flex-1">
                <Link href={`/${slug}/${post.slug}`}>
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
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{post.author?.name}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-bg-light rounded-full flex items-center justify-center mb-4 border border-border-subtle">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">No articles found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                We're currently working on bringing you fresh content for this topic. Check back soon.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-border-subtle rounded-md hover:bg-bg-light hover:border-brand-primary/30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={buildPageUrl(page)}
                className={`w-9 h-9 inline-flex items-center justify-center text-xs font-bold rounded-md border transition-colors ${
                  page === currentPage
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-border-subtle hover:bg-bg-light hover:border-brand-primary/30"
                }`}
              >
                {page}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-border-subtle rounded-md hover:bg-bg-light hover:border-brand-primary/30 transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Category Long Description (shown after articles) */}
        {category.longDescription && (
          <div className="mt-16 border-t border-border-subtle pt-12">
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight mb-6">
              About {category.name}
            </h2>
            <div
              className="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-brand-primary hover:prose-a:text-brand-hover"
              dangerouslySetInnerHTML={{ __html: category.longDescription }}
            />
          </div>
        )}
      </div>
    );
  }

  // 2. Try to find a page if category is not found
  const page = await prisma.page.findUnique({
    where: { slug: slug, status: "PUBLISHED" },
    include: { author: { select: { name: true, title: true, image: true } } },
  });

  if (page) {
    let processedContent = page.content || "";
    const faqRegex = /<div[^>]*data-type="faq"[^>]*data-faq-items="([^"]*)"[^>]*><\/div>/g;
    processedContent = processedContent.replace(faqRegex, (_match, encodedItems: string) => {
      try {
        const items = JSON.parse(decodeURIComponent(encodedItems));
        if (!items || items.length === 0) return "";
        const faqHtml = items.map((item: any, idx: number) => `
          <div class="faq-accordion-item border border-border-subtle rounded-lg overflow-hidden">
            <button class="faq-accordion-trigger w-full flex items-center justify-between p-4 text-left bg-bg-light/60 hover:bg-bg-light transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.faq-arrow').classList.toggle('rotate-180');" type="button">
              <span class="font-bold text-sm text-text-primary pr-4">${item.question || "Untitled Question"}</span>
              <svg class="faq-arrow w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
            </button>
            <div class="faq-accordion-content p-4 pt-0 text-sm text-gray-600 leading-relaxed font-medium ${idx === 0 ? "" : "hidden"}">
              ${item.answer || ""}
            </div>
          </div>
        `).join("");
        return `<div class="my-8 faq-accordion-block"><h3 class="font-bold text-lg text-text-primary mb-4 flex items-center gap-2"><svg class="w-5 h-5 text-brand-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg> Frequently Asked Questions</h3><div class="flex flex-col gap-2">${faqHtml}</div></div>`;
      } catch {
        return "";
      }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronicle.com";
    const pageSchema = generatePageSchema(page, siteUrl);
    const pageBreadcrumbSchema = generatePageBreadcrumbSchema(page, siteUrl);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageBreadcrumbSchema }}
        />
        <article className="bg-white">
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.1] mb-6">
              {page.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-t border-border-subtle pt-6">
              <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
            </div>
          </header>
          
          <div 
            className="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-brand-primary hover:prose-a:text-brand-hover prose-img:rounded-md"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </article>
      </div>
    );
  }

  // 3. Not found
  notFound();
}
