// src/app/(public)/[category]/[postSlug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPostPageData } from "@/lib/queries";
import { incrementPostViews } from "@/actions/posts";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, User, MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import CommentForm from "./CommentForm";
import dynamic from "next/dynamic";
const ShareButtons = dynamic(() => import("@/components/public/ShareButtons"));
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, category: { select: { slug: true } } },
    orderBy: { publishedAt: "desc" },
    take: 200,
  });
  return posts.map((post) => ({ slug: post.category.slug, postSlug: post.slug }));
}

interface PostPageProps {
  params: Promise<{
    category: string;
    postSlug: string;
  }>;
}

// Inline TipTap node parser
interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, any> }[];
}

function renderTipTapNode(node: TipTapNode): string {
  if (node.type === "text") {
    let text = node.text || "";
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") text = `<strong>${text}</strong>`;
        if (mark.type === "italic") text = `<em>${text}</em>`;
        if (mark.type === "underline") text = `<u>${text}</u>`;
        if (mark.type === "link") {
          text = `<a href="${mark.attrs?.href}" target="_blank" rel="noopener noreferrer" class="text-brand-primary underline hover:text-brand-hover">${text}</a>`;
        }
      }
    }
    return text;
  }

  const childrenHtml = node.content ? node.content.map(renderTipTapNode).join("") : "";

  switch (node.type) {
    case "doc":
      return childrenHtml;
    case "paragraph":
      return `<p>${childrenHtml}</p>`;
    case "heading":
      const level = node.attrs?.level || 1;
      // Add id to allow smooth scrolls from table of contents
      const headingText = node.content?.[0]?.text || "";
      const headingId = headingText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return `<h${level} id="${headingId}" class="scroll-mt-24 font-serif font-black text-text-primary mt-8 mb-4">${childrenHtml}</h${level}>`;
    case "blockquote":
      return `<blockquote class="border-l-4 border-brand-primary pl-6 py-1 italic my-6 text-gray-600 font-serif text-lg">${childrenHtml}</blockquote>`;
    case "bulletList":
      return `<ul class="list-disc pl-6 mb-6 flex flex-col gap-2">${childrenHtml}</ul>`;
    case "orderedList":
      return `<ol class="list-decimal pl-6 mb-6 flex flex-col gap-2">${childrenHtml}</ol>`;
    case "listItem":
      return `<li class="text-gray-700">${childrenHtml}</li>`;
    case "horizontalRule":
      return `<hr class="border-t border-border-subtle my-8" />`;
    case "image":
      return `<figure class="my-8">
                <img src="${node.attrs?.src}" alt="${node.attrs?.alt || ""}" class="w-full max-h-[500px] object-cover rounded-sm" />
                ${node.attrs?.title ? `<figcaption class="text-xs text-gray-500 mt-2 text-center font-medium">${node.attrs.title}</figcaption>` : ""}
              </figure>`;
    case "faq": {
      const faqItems = node.attrs?.items || [];
      if (faqItems.length === 0) return "";
      const faqId = `faq-${Math.random().toString(36).slice(2, 8)}`;
      const faqHtml = faqItems.map((item: any, idx: number) => `
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
      return `<div class="my-8 faq-accordion-block" data-faq-id="${faqId}"><h3 class="font-bold text-lg text-text-primary mb-4 flex items-center gap-2"><svg class="w-5 h-5 text-brand-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg> Frequently Asked Questions</h3><div class="flex flex-col gap-2">${faqHtml}</div></div>`;
    }
    default:
      return childrenHtml;
  }
}

function parseTipTap(jsonStr: string) {
  try {
    const doc = JSON.parse(jsonStr);
    const html = renderTipTapNode(doc);
    const headings: { text: string; id: string; level: number }[] = [];

    if (doc.content) {
      doc.content.forEach((node: any) => {
        if (node.type === "heading" && node.content?.[0]?.text) {
          const text = node.content[0].text;
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          headings.push({ text, id, level: node.attrs?.level || 2 });
        }
      });
    }

    return { html, headings };
  } catch (error) {
    return { html: jsonStr, headings: [] };
  }
}

function InlineAd({ ad, label }: { ad: any; label?: string }) {
  if (!ad) return null;
  return (
    <div className="my-6 py-4 border-y border-border-subtle bg-bg-light/30 flex justify-center text-center">
      <div className="max-w-full">
        {label && <span className="text-[8px] font-extrabold uppercase tracking-widest text-gray-300 block mb-1">{label}</span>}
        {ad.type === "IMAGE" && ad.imageUrl ? (
          ad.targetUrl ? (
            <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer">
              <img src={ad.imageUrl} alt={ad.title} className="max-h-[120px] w-auto mx-auto rounded" loading="lazy" />
            </a>
          ) : (
            <img src={ad.imageUrl} alt={ad.title} className="max-h-[120px] w-auto mx-auto rounded" loading="lazy" />
          )
        ) : ad.code ? (
          <div dangerouslySetInnerHTML={{ __html: ad.code }} />
        ) : null}
      </div>
    </div>
  );
}

function renderAdHtml(ad: any): string {
  if (!ad) return "";
  const label = '<div style="text-align:center;margin:24px 0;padding:16px;border-top:1px solid #eaeaea;border-bottom:1px solid #eaeaea;background:#f9f9f9"><span style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#ccc;display:block;margin-bottom:4px">Advertisement</span>';
  if (ad.type === "IMAGE" && ad.imageUrl) {
    const img = `<img src="${ad.imageUrl}" alt="${ad.title}" style="max-height:100px;width:auto;margin:0 auto;border-radius:4px" loading="lazy" />`;
    const content = ad.targetUrl ? `<a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer">${img}</a>` : img;
    return label + content + "</div>";
  }
  if (ad.code) return label + ad.code + "</div>";
  return "";
}

function injectParagraphAds(html: string, ads: { afterPara1: any; afterPara2: any; afterPara3: any }) {
  const parts = html.split(/<\/p>/i);
  if (parts.length <= 1) return html;

  let result = "";
  let paraCount = 0;
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < parts.length - 1) {
      result += "</p>";
      paraCount++;
      if (paraCount === 1 && ads.afterPara1) {
        result += renderAdHtml(ads.afterPara1);
      } else if (paraCount === 2 && ads.afterPara2) {
        result += renderAdHtml(ads.afterPara2);
      } else if (paraCount === 3 && ads.afterPara3) {
        result += renderAdHtml(ads.afterPara3);
      }
    }
  }
  return result;
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const { category: categorySlug, postSlug } = resolvedParams;

  // 1. Fetch post details (must be first for not-found check)
  const post = await prisma.post.findUnique({
    where: { slug: postSlug },
    include: {
      author: true,
      category: true,
      tags: { select: { id: true, name: true, slug: true } },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { name: true, image: true, role: true }
          }
        }
      }
    }
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // 2. Increment view count asynchronously (non-blocking)
  incrementPostViews(post.id).catch(() => {});

  // 3. Compile TipTap content & headings
  const { html } = parseTipTap(post.content);

  // 4. Fetch all secondary data in parallel using cached queries
  const [
    relatedPosts,
    [sidebarAd, aboveHeadingAd, belowHeadingAd, afterPara1Ad, afterPara2Ad, afterPara3Ad, startOfArticleAd, endOfArticleAd, sidebarConfig, footerSetting, trendingPosts, latestPosts],
    session,
  ] = await Promise.all([
    prisma.post.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id },
        status: "PUBLISHED",
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    }),
    getPostPageData(),
    auth(),
  ]);

  let sidebarWidgets: any[] = [];
  try {
    sidebarWidgets = sidebarConfig ? JSON.parse(sidebarConfig.value).widgets || [] : [];
  } catch { sidebarWidgets = []; }

  let socialLinks: Record<string, string> = {};
  try {
    socialLinks = footerSetting ? JSON.parse(footerSetting.value).socialLinks || {} : {};
  } catch { socialLinks = {}; }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const siteUrl = "https://chronicle.com";
  const articleSchema = generateNewsArticleSchema(post, siteUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(post, siteUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
      {/* Category header and title */}
      {aboveHeadingAd && <InlineAd ad={aboveHeadingAd} />}
      <div className="max-w-4xl border-b border-border-subtle pb-8 mb-10">
        <Link
          href={`/${post.category.slug}`}
          className="text-xs font-extrabold uppercase tracking-widest text-brand-primary hover:underline"
          style={{ color: "var(--brand-primary)" }}
        >
          {post.category.name}
        </Link>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-text-primary mt-3 leading-tight tracking-tight">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="text-base sm:text-lg text-gray-500 font-semibold mt-3 leading-relaxed">
            {post.subtitle}
          </p>
        )}

        {/* Post Stats */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 font-bold mt-6 select-none">
          <span className="flex items-center gap-1.5 text-text-primary">
            <User className="w-4 h-4 text-brand-primary" /> By {post.author.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {publishedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {post.viewCount + 1} views
          </span>
        </div>
      </div>

      {belowHeadingAd && <InlineAd ad={belowHeadingAd} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Block (col-span-8) */}
        <article className="lg:col-span-8 flex flex-col gap-8">
          {startOfArticleAd && <InlineAd ad={startOfArticleAd} />}
          {post.featuredImage && (
            <div className="aspect-[21/10] overflow-hidden rounded-sm bg-bg-light border border-border-subtle shadow-sm select-none relative">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
                quality={85}
              />
            </div>
          )}

          {/* Sponsored header banner if exists */}
          {post.isSponsored && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] uppercase tracking-widest font-extrabold px-4 py-2 rounded-sm select-none">
              Sponsored Content
            </div>
          )}

          {/* Render parsed TipTap body html */}
          <div
            className="tiptap-content text-gray-800 font-serif leading-relaxed text-[17px] sm:text-[18px] tracking-wide"
            dangerouslySetInnerHTML={{ __html: injectParagraphAds(html, { afterPara1: afterPara1Ad, afterPara2: afterPara2Ad, afterPara3: afterPara3Ad }) }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
              {post.tags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="px-3 py-1 bg-bg-light border border-border-subtle rounded-full text-[11px] font-bold text-gray-500 hover:text-brand-primary hover:border-brand-primary/30 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Social Share Controls */}
          <ShareButtons
            url={`${siteUrl}/${post.category.slug}/${post.slug}`}
            title={post.title}
          />

          {endOfArticleAd && <InlineAd ad={endOfArticleAd} />}

          {/* Author Box */}
          <div className="bg-bg-light border border-border-subtle p-6 rounded-md flex gap-4 sm:gap-6 mt-6 select-none">
            {post.author.image ? (
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 relative">
                <Image
                  src={post.author.image}
                  alt={post.author.name || ""}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xl shrink-0">
                {post.author.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div>
                <h4 className="font-serif font-black text-base text-text-primary">
                  {post.author.name}
                </h4>
                {post.author.title && (
                  <p className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">
                    {post.author.title}
                  </p>
                )}
              </div>
              {post.author.bio && (
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  {post.author.bio}
                </p>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <Suspense fallback={<div className="h-[300px] bg-gray-50 rounded-md animate-pulse" />}>
            <div className="border-t border-border-subtle pt-12 mt-8 flex flex-col gap-8">
              <h3 className="font-serif font-black text-xl text-text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-primary" /> Comments ({post.comments.length})
              </h3>
              
              {/* Comment Submission Component (Client component) */}
              <CommentForm postId={post.id} session={session} />

              {/* List of comments */}
              <div className="divide-y divide-border-subtle">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="py-6 first:pt-0 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {(comment.author?.name || comment.guestName)?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">
                          {comment.author?.name || comment.guestName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {post.comments.length === 0 && (
                  <p className="text-xs text-gray-400 font-semibold italic text-center py-6">No discussions yet. Be the first to share your thoughts.</p>
                )}
              </div>
            </div>
          </Suspense>
        </article>

        {/* Sidebar Panel (col-span-4) */}
        <aside className="lg:col-span-4 flex flex-col gap-8 select-none">
          {/* Configurable Sidebar Widgets */}
          <Suspense fallback={<div className="h-[200px] bg-gray-50 rounded-md animate-pulse" />}>
            {sidebarWidgets.filter((w: any) => w.enabled).map((widget: any) => {
            if (widget.type === "ad") {
              const ad = sidebarAd;
              if (!ad) return null;
              return (
                <div key={widget.id} className="border border-border-subtle p-4 rounded-md bg-white flex flex-col items-center gap-3">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400 self-start">{widget.title}</span>
                  {ad.type === "IMAGE" && ad.imageUrl ? (
                    <a href={ad.targetUrl || "#"} target="_blank" rel="noreferrer">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto rounded-sm" />
                    </a>
                  ) : ad.code ? (
                    <div dangerouslySetInnerHTML={{ __html: ad.code }} className="w-full" />
                  ) : null}
                </div>
              );
            }

            if (widget.type === "social") {
              const socialEntries = Object.entries(socialLinks).filter(([_, url]) => url);
              if (socialEntries.length === 0) return null;
              return (
                <div key={widget.id} className="border border-border-subtle p-5 rounded-md bg-white">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-4 pb-2 border-b border-border-subtle">{widget.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {socialEntries.map(([platform, url]) => (
                      <a key={platform} href={url as string} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-bg-light border border-border-subtle flex items-center justify-center text-gray-500 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all" title={platform}>
                        <span className="text-xs font-bold uppercase">{platform[0]}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            }

            if (widget.type === "html" || widget.type === "custom") {
              const code = widget.settings?.code || widget.settings?.html || "";
              if (!code) return null;
              return (
                <div key={widget.id} className="border border-border-subtle p-4 rounded-md bg-white">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-3 pb-2 border-b border-border-subtle">{widget.title}</h3>
                  <div dangerouslySetInnerHTML={{ __html: code }} />
                </div>
              );
            }

            if (widget.type === "trending") {
              const count = widget.settings?.count || 5;
              const posts = trendingPosts.slice(0, count);
              if (posts.length === 0) return null;
              return (
                <div key={widget.id} className="border border-border-subtle p-5 rounded-md bg-white">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-4 pb-2 border-b border-border-subtle">{widget.title}</h3>
                  <div className="flex flex-col gap-3">
                    {posts.map((p: any, idx: number) => (
                      <div key={p.id} className="flex gap-3 group">
                        <span className="text-2xl font-black text-gray-200 leading-none shrink-0 w-8 text-center">{idx + 1}</span>
                        <div className="flex flex-col gap-1">
                          <Link href={`/${p.category.slug}/${p.slug}`} className="text-xs font-bold text-text-primary group-hover:text-brand-primary leading-snug line-clamp-2 transition-colors">{p.title}</Link>
                          <span className="text-[10px] text-gray-400 font-semibold">{p.viewCount} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (widget.type === "latest_posts") {
              const count = widget.settings?.count || 5;
              const catSlug = widget.settings?.categorySlug;
              let posts = latestPosts;
              if (catSlug) posts = posts.filter((p: any) => p.category.slug === catSlug);
              posts = posts.slice(0, count);
              if (posts.length === 0) return null;
              return (
                <div key={widget.id} className="border border-border-subtle p-5 rounded-md bg-white">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-4 pb-2 border-b border-border-subtle">{widget.title}</h3>
                  <div className="flex flex-col gap-3">
                    {posts.map((p: any) => (
                      <div key={p.id} className="flex gap-3 group">
                        {p.featuredImage && (
                          <Link href={`/${p.category.slug}/${p.slug}`} className="w-16 h-12 rounded overflow-hidden shrink-0 bg-gray-100 relative">
                            <Image src={p.featuredImage} alt="" fill sizes="64px" className="object-cover" />
                          </Link>
                        )}
                        <div className="flex flex-col gap-1 min-w-0">
                          <Link href={`/${p.category.slug}/${p.slug}`} className="text-xs font-bold text-text-primary group-hover:text-brand-primary leading-snug line-clamp-2 transition-colors">{p.title}</Link>
                          <span className="text-[10px] text-gray-400 font-semibold">{new Date(p.publishedAt || p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (widget.type === "newsletter") {
              return (
                <div key={widget.id} className="border border-border-subtle p-5 rounded-md bg-white text-center">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-2">{widget.title}</h3>
                  {widget.settings?.description && (
                    <p className="text-[11px] text-gray-500 mb-3">{widget.settings.description}</p>
                  )}
                  <div className="flex gap-2">
                    <input type="email" placeholder="Your email" className="flex-1 text-xs px-3 py-2 border border-border-subtle rounded-md outline-none focus:border-brand-primary" />
                    <button className="px-3 py-2 bg-brand-primary text-white text-xs font-bold rounded-md hover:bg-brand-hover transition-colors">Subscribe</button>
                  </div>
                </div>
              );
            }

            return null;
          })}
          </Suspense>

          {/* Related Articles (always shown at bottom) */}
          {relatedPosts.length > 0 && (
            <div className="flex flex-col gap-5 border border-border-subtle p-6 rounded-md bg-white">
              <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary pb-2 border-b border-border-subtle">
                Related Reading
              </h3>
              <div className="flex flex-col gap-4">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id} className="flex flex-col gap-1 group">
                    <h4 className="font-serif font-bold text-sm text-text-primary group-hover:text-brand-primary leading-snug transition-colors line-clamp-2">
                      <Link href={`/${post.category.slug}/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(relatedPost.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
