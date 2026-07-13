// src/app/(admin)/admin/settings/page.tsx
import { getSetting } from "@/lib/settings";
import SettingsManager from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [generalRaw, seoRaw, sitemapRaw, indexingRaw, homepageRaw] = await Promise.all([
    getSetting("general_settings"),
    getSetting("seo_settings"),
    getSetting("sitemap_settings"),
    getSetting("indexing_settings"),
    getSetting("homepage_settings"),
  ]);

  const general = generalRaw || {};
  const seo = seoRaw || {};
  let sitemap = { posts: true, pages: true, categories: true };
  if (sitemapRaw) {
    sitemap = {
      posts: sitemapRaw.posts ?? sitemapRaw.includePosts ?? true,
      pages: sitemapRaw.pages ?? sitemapRaw.includePages ?? true,
      categories: sitemapRaw.categories ?? sitemapRaw.includeCategories ?? true,
    };
  }
  let indexing = { discourageIndexing: false };
  if (indexingRaw) {
    indexing = { discourageIndexing: indexingRaw.discourageIndexing ?? false };
  }
  let homepage = { showCategoryBar: true };
  if (homepageRaw) {
    homepage = { showCategoryBar: homepageRaw.showCategoryBar ?? true };
  }

  return (
    <SettingsManager
      general={general}
      seo={seo}
      sitemap={sitemap}
      indexing={indexing}
      homepage={homepage}
    />
  );
}
