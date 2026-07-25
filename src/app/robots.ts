// src/app/robots.ts
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronicle.com";

  let indexingConfig = { discourageIndexing: false };
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "indexing_settings"))
      .limit(1);
    if (result[0]) indexingConfig = JSON.parse(result[0].value);
  } catch {
    // DB unavailable during build — use defaults
  }

  if (indexingConfig.discourageIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
