// src/components/public/sections/HomepageShell.tsx
import { getHomepageLayout, getCategories } from "@/lib/queries";
import Link from "next/link";

export default async function HomepageShell() {
  const [{ rawLayout, showCategoryBar }, categories] = await Promise.all([
    getHomepageLayout(),
    getCategories(),
  ]);

  const defaultLayout = [
    { id: "default_hero", type: "HeroSlider", enabled: true, settings: {} },
    { id: "default_news", type: "LatestNews", enabled: true, settings: { title: "News & Views", postsCount: 4 } },
    { id: "default_newsletter", type: "NewsletterSignup", enabled: true, settings: {} },
    { id: "default_featured", type: "FeaturedArticles", enabled: true, settings: { title: "In Case You Missed It", postsCount: 4 } },
  ];

  const layout = rawLayout && rawLayout.length > 0 ? rawLayout : defaultLayout;

  return { layout, showCategoryBar, categories };
}

export function CategoryBar({ categories }: { categories: any[] }) {
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

export function SectionFallback() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-48 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-md overflow-hidden">
            <div className="aspect-[16/10] bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroFallback() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
        <div className="lg:col-span-7 bg-gray-100 min-h-[400px] lg:min-h-[500px]" />
        <div className="lg:col-span-5 grid grid-cols-2 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 min-h-[200px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
