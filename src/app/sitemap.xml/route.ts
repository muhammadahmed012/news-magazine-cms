// src/app/sitemap.xml/route.ts
import { db } from "@/lib/db";
import { posts, pages as pagesTable, categories, settings } from "@/lib/schema";
import { eq, desc, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronicle.com";

  let sitemapConfig = { posts: true, pages: true, categories: true };
  let indexingConfig = { discourageIndexing: false };

  try {
    const [sitemapSetting, indexingSetting] = await Promise.all([
      db.select().from(settings).where(eq(settings.key, "sitemap_settings")).then((r) => r[0]),
      db.select().from(settings).where(eq(settings.key, "indexing_settings")).then((r) => r[0]),
    ]);

    if (sitemapSetting) {
      const raw = JSON.parse(sitemapSetting.value);
      sitemapConfig = {
        posts: raw.posts ?? raw.includePosts ?? true,
        pages: raw.pages ?? raw.includePages ?? true,
        categories: raw.categories ?? raw.includeCategories ?? true,
      };
    }

    if (indexingSetting) indexingConfig = JSON.parse(indexingSetting.value);
  } catch {
    // DB unavailable — use defaults
  }

  const entries: string[] = [];

  if (!indexingConfig.discourageIndexing) {
    entries.push(`  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

    try {
      if (sitemapConfig.posts) {
        const postsResult = await db
          .select({
            slug: posts.slug,
            updatedAt: posts.updatedAt,
            categorySlug: categories.slug,
          })
          .from(posts)
          .innerJoin(categories, eq(posts.categoryId, categories.id))
          .where(eq(posts.status, "PUBLISHED"))
          .orderBy(desc(posts.publishedAt));

        for (const post of postsResult) {
          entries.push(`  <url>
    <loc>${siteUrl}/${post.categorySlug}/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
        }
      }

      if (sitemapConfig.pages) {
        const pagesResult = await db
          .select({ slug: pagesTable.slug, updatedAt: pagesTable.updatedAt })
          .from(pagesTable)
          .where(eq(pagesTable.status, "PUBLISHED"))
          .orderBy(desc(pagesTable.updatedAt));

        for (const page of pagesResult) {
          entries.push(`  <url>
    <loc>${siteUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
        }
      }

      if (sitemapConfig.categories) {
        const categoriesResult = await db
          .select({ slug: categories.slug, updatedAt: categories.updatedAt })
          .from(categories)
          .orderBy(asc(categories.name));

        for (const cat of categoriesResult) {
          entries.push(`  <url>
    <loc>${siteUrl}/${cat.slug}</loc>
    <lastmod>${cat.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
        }
      }
    } catch {
      // DB queries failed — return minimal sitemap
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
