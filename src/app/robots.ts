// src/app/robots.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronicle.com";

  const indexingSetting = await prisma.setting.findUnique({ where: { key: "indexing_settings" } });
  let indexingConfig = { discourageIndexing: false };
  try {
    if (indexingSetting) indexingConfig = JSON.parse(indexingSetting.value);
  } catch {}

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
