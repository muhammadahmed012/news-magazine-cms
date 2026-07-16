// src/app/(public)/page.tsx
import { Suspense } from "react";
import { getHomepageLayout, getCategories, getHomepageAds } from "@/lib/queries";
import Link from "next/link";
import HeroSection from "@/components/public/sections/HeroSection";
import LatestNewsSection from "@/components/public/sections/LatestNewsSection";
import FeaturedSection from "@/components/public/sections/FeaturedSection";
import CollectionSection from "@/components/public/sections/CollectionSection";
import NewsletterSection from "@/components/public/sections/NewsletterSection";
import CategoryCardRenderer from "@/components/public/CategoryCardStyles";
import { SectionFallback, HeroFallback } from "@/components/public/sections/HomepageShell";

export const revalidate = 300;

interface LayoutSection {
  id: string;
  type: string;
  enabled: boolean;
  settings: {
    title?: string;
    subtitle?: string;
    postsCount?: number;
    categorySlug?: string;
    layout?: "grid" | "row";
    cardStyle?: string;
    sidebarType?: "trending" | "latest" | "category";
  };
}

async function CategoryBar() {
  const categories = await getCategories();
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
          <Link
            href="/"
            className="py-3 text-[11px] font-extrabold uppercase tracking-widest text-brand-primary border-b-2 border-brand-primary whitespace-nowrap"
          >
            All Topics
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-brand-primary border-b-2 border-transparent hover:border-brand-primary whitespace-nowrap transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdSection({ adId, ads }: { adId: string; ads: any[] }) {
  const matchingAd = ads.find((ad: any) => ad.targetSection === adId);
  if (!matchingAd) return null;
  return (
    <div className="my-8 py-4 border-y border-border-subtle bg-bg-light/35 flex justify-center text-center">
      <div className="max-w-full">
        <span className="text-[8px] font-extrabold uppercase tracking-widest text-gray-300 block mb-1">
          Advertisement
        </span>
        {matchingAd.type === "IMAGE" && matchingAd.imageUrl ? (
          matchingAd.targetUrl ? (
            <a href={matchingAd.targetUrl} target="_blank" rel="noopener noreferrer" className="block">
              <img src={matchingAd.imageUrl} alt={matchingAd.title} className="max-h-[120px] w-auto mx-auto rounded" loading="lazy" />
            </a>
          ) : (
            <img src={matchingAd.imageUrl} alt={matchingAd.title} className="max-h-[120px] w-auto mx-auto rounded" loading="lazy" />
          )
        ) : (
          matchingAd.code && <div dangerouslySetInnerHTML={{ __html: matchingAd.code }} />
        )}
      </div>
    </div>
  );
}

async function SectionRenderer({ section }: { section: LayoutSection }) {
  if (!section.enabled) return null;

  const { type, settings } = section;

  switch (type) {
    case "HeroSlider":
      return <HeroSection />;
    case "LatestNews":
      return (
        <LatestNewsSection
          title={settings?.title}
          postsCount={settings?.postsCount}
          categorySlug={settings?.categorySlug}
        />
      );
    case "FeaturedArticles":
      return (
        <FeaturedSection
          title={settings?.title}
          postsCount={settings?.postsCount}
          categorySlug={settings?.categorySlug}
        />
      );
    case "CollectionBlock":
      return (
        <CollectionSection
          title={settings?.title}
          postsCount={settings?.postsCount}
          categorySlug={settings?.categorySlug}
          sidebarType={settings?.sidebarType}
        />
      );
    case "NewsletterSignup":
      return <NewsletterSection />;
    case "CategoryBlock": {
      const { prisma } = await import("@/lib/db");
      let posts: any[] = [];
      try {
        posts = await prisma.post.findMany({
          where: { status: "PUBLISHED", category: { slug: settings?.categorySlug } },
          orderBy: { publishedAt: "desc" },
          take: settings?.postsCount || 4,
          include: {
            author: { select: { name: true, image: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        });
      } catch (error) {
        console.error("[SectionRenderer] Failed to fetch category posts:", error);
      }
      if (posts.length === 0) return null;
      return (
        <CategoryCardRenderer
          posts={posts}
          title={settings?.title || posts[0]?.category.name}
          categorySlug={settings?.categorySlug}
          style={settings?.cardStyle || "classic"}
        />
      );
    }
    default:
      return null;
  }
}

export default async function HomePage() {
  let rawLayout: any = null;
  let showCategoryBar = true;
  let activeAds: any[] = [];

  try {
    const [layoutData, ads] = await Promise.all([
      getHomepageLayout(),
      getHomepageAds(),
    ]);
    rawLayout = layoutData.rawLayout;
    showCategoryBar = layoutData.showCategoryBar;
    activeAds = ads;
  } catch (error) {
    console.error("[HomePage] Failed to fetch layout/ads:", error);
  }

  const defaultLayout: LayoutSection[] = [
    { id: "default_hero", type: "HeroSlider", enabled: true, settings: {} },
    { id: "default_news", type: "LatestNews", enabled: true, settings: { title: "News & Views", postsCount: 4 } },
    { id: "default_newsletter", type: "NewsletterSignup", enabled: true, settings: {} },
    { id: "default_featured", type: "FeaturedArticles", enabled: true, settings: { title: "In Case You Missed It", postsCount: 4 } },
  ];

  const layout: LayoutSection[] = rawLayout && rawLayout.length > 0 ? rawLayout : defaultLayout;

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        {showCategoryBar && <CategoryBar />}
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {layout.map((sec) => (
          <div key={sec.id}>
            <Suspense fallback={sec.type === "HeroSlider" ? <HeroFallback /> : <SectionFallback />}>
              <SectionRenderer section={sec} />
            </Suspense>
            <Suspense fallback={null}>
              <AdSection adId={sec.id} ads={activeAds} />
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}
