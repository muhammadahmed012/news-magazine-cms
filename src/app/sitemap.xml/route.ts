// src/app/sitemap.xml/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronicle.com";

  const [sitemapSetting, indexingSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "sitemap_settings" } }),
    prisma.setting.findUnique({ where: { key: "indexing_settings" } }),
  ]);

  let sitemapConfig = { posts: true, pages: true, categories: true };
  try {
    if (sitemapSetting) {
      const raw = JSON.parse(sitemapSetting.value);
      sitemapConfig = {
        posts: raw.posts ?? raw.includePosts ?? true,
        pages: raw.pages ?? raw.includePages ?? true,
        categories: raw.categories ?? raw.includeCategories ?? true,
      };
    }
  } catch {}

  let indexingConfig = { discourageIndexing: false };
  try { if (indexingSetting) indexingConfig = JSON.parse(indexingSetting.value); } catch {}

  const entries: string[] = [];

  if (!indexingConfig.discourageIndexing) {
    // Homepage
    entries.push(`  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

    // Posts
    if (sitemapConfig.posts) {
      const posts = await prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
        orderBy: { publishedAt: "desc" },
      });
      for (const post of posts) {
        entries.push(`  <url>
    <loc>${siteUrl}/${post.category.slug}/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }

    // Pages
    if (sitemapConfig.pages) {
      const pages = await prisma.page.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      });
      for (const page of pages) {
        entries.push(`  <url>
    <loc>${siteUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
    }

    // Categories
    if (sitemapConfig.categories) {
      const categories = await prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { name: "asc" },
      });
      for (const cat of categories) {
        entries.push(`  <url>
    <loc>${siteUrl}/${cat.slug}</loc>
    <lastmod>${cat.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
