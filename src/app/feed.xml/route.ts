// src/app/feed.xml/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronicle.com";

    // Fetch latest 10 published posts
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 10,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } }
      }
    });

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Chronicle</title>
    <link>${siteUrl}</link>
    <description>Premium, minimal &amp; modern enterprise News &amp; Magazine CMS.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

    posts.forEach((post) => {
      const postUrl = `${siteUrl}/${post.category.slug}/${post.slug}`;
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date(post.createdAt).toUTCString();
      const excerptClean = (post.excerpt || post.subtitle || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      rss += `    <item>
      <title>${post.title.replace(/&/g, "&amp;")}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${post.author.name || "Chronicle Staff"}</dc:creator>
      <category>${post.category.name}</category>
      <description>${excerptClean}</description>
    </item>
`;
    });

    rss += `  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=18000, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error creating RSS feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
