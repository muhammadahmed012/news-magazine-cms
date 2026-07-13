// src/app/(public)/page.tsx
import { getSetting } from "@/lib/settings";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Calendar, Clock, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import CategoryCardRenderer from "@/components/public/CategoryCardStyles";

export const dynamic = "force-dynamic";

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

async function getHomepageData() {
  const [layoutSetting, categories, activeAds, homepageSettingsRaw] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "homepage_layout" } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      take: 8,
    }),
    prisma.ad.findMany({
      where: { placement: "HOMEPAGE", status: "ACTIVE" },
    }),
    prisma.setting.findUnique({ where: { key: "homepage_settings" } }),
  ]);

  const rawLayout = layoutSetting ? JSON.parse(layoutSetting.value) : null;
  
  // Fallback default layout if empty or unset
  const layout: LayoutSection[] = rawLayout && rawLayout.length > 0 ? rawLayout : [
    { id: "default_hero", type: "HeroSlider", enabled: true, settings: {} },
    { id: "default_news", type: "LatestNews", enabled: true, settings: { title: "News & Views", postsCount: 4 } },
    { id: "default_newsletter", type: "NewsletterSignup", enabled: true, settings: {} },
    { id: "default_featured", type: "FeaturedArticles", enabled: true, settings: { title: "In Case You Missed It", postsCount: 4 } }
  ];

  let showCategoryBar = true;
  try {
    if (homepageSettingsRaw) {
      const parsed = JSON.parse(homepageSettingsRaw.value);
      showCategoryBar = parsed.showCategoryBar !== false;
    }
  } catch {}

  return { layout, categories, activeAds, showCategoryBar };
}

function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function HomePage() {
  const { layout, categories, activeAds, showCategoryBar } = await getHomepageData();

  // Helper to fetch posts dynamically for a section
  const fetchSectionPosts = async (section: LayoutSection) => {
    const limit = section.settings?.postsCount || 4;
    const categorySlug = section.settings?.categorySlug;

    const whereClause: any = { status: "PUBLISHED" };
    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    if (section.type === "FeaturedArticles") {
      whereClause.isEditorPick = true;
    }

    return prisma.post.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        author: { select: { name: true, title: true, image: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
    });
  };

  // Pre-load data for each block in order to do async rendering efficiently
  const resolvedSections = await Promise.all(
    layout.map(async (sec) => {
      if (!sec.enabled) return null;
      let posts: any[] = [];
      if (sec.type === "HeroSlider") {
        // Fetch hero articles
        const featured = await prisma.post.findFirst({
          where: { status: "PUBLISHED", isFeatured: true },
          orderBy: { publishedAt: "desc" },
          include: {
            author: { select: { name: true, title: true, image: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        });
        const sidePosts = await prisma.post.findMany({
          where: { status: "PUBLISHED", id: featured ? { not: featured.id } : undefined },
          orderBy: { publishedAt: "desc" },
          take: 4,
          include: {
            author: { select: { name: true, title: true, image: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        });
        posts = featured ? [featured, ...sidePosts] : sidePosts;
      } else if (sec.type === "CollectionBlock") {
        const limit = sec.settings?.postsCount || 5;
        const catSlug = sec.settings?.categorySlug;
        const whereClause: any = { status: "PUBLISHED" };
        if (catSlug) whereClause.category = { slug: catSlug };
        posts = await prisma.post.findMany({
          where: whereClause,
          orderBy: { publishedAt: "desc" },
          take: limit,
          include: {
            author: { select: { name: true, title: true, image: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        });
      } else if (sec.type !== "NewsletterSignup") {
        posts = await fetchSectionPosts(sec);
      }
      return { ...sec, posts, sidebarPosts: [] as any[] };
    })
  );

  // Trending section data (global trending fallback used inside FeaturedArticles or end of layout)
  const globalTrending = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take: 6,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true, color: true } },
    },
  });

  // Fetch sidebar posts for CollectionBlock sections
  const resolvedWithSidebar = await Promise.all(
    resolvedSections.map(async (sec) => {
      if (!sec || sec.type !== "CollectionBlock") return sec;
      const sidebarType = sec.settings?.sidebarType || "trending";
      let sidebarPosts: any[] = [];
      if (sidebarType === "trending") {
        sidebarPosts = globalTrending;
      } else if (sidebarType === "latest") {
        sidebarPosts = await prisma.post.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 6,
          include: {
            author: { select: { name: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        });
      } else if (sidebarType === "category" && sec.settings?.categorySlug) {
        sidebarPosts = await prisma.post.findMany({
          where: { status: "PUBLISHED", category: { slug: sec.settings.categorySlug } },
          orderBy: { publishedAt: "desc" },
          take: 6,
          include: {
            author: { select: { name: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        });
      } else {
        sidebarPosts = globalTrending;
      }
      return { ...sec, sidebarPosts };
    })
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── Category Navigation Tabs ── */}
      {showCategoryBar && (
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
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {resolvedWithSidebar.map((sec) => {
          if (!sec) return null;

          const renderSection = () => {
            switch (sec.type) {
              case "HeroSlider": {
                const mainPost = sec.posts[0];
                const secondaryPosts = sec.posts.slice(1, 5);
                return (
                  <div key={sec.id} className="grid grid-cols-1 lg:grid-cols-12 gap-1 mb-8">
                    {/* Main Hero Story */}
                    {mainPost && (
                      <div className="lg:col-span-7 group relative overflow-hidden bg-black min-h-[400px] lg:min-h-[500px]">
                        <Link href={`/${mainPost.category.slug}/${mainPost.slug}`} className="absolute inset-0">
                          {mainPost.featuredImage && (
                            <img
                              src={mainPost.featuredImage}
                              alt={mainPost.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-90"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </Link>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white">
                          <Link href={`/${mainPost.category.slug}`}>
                            <span
                              className="inline-block text-[11px] font-black uppercase tracking-widest mb-3 px-2 py-1 text-white bg-brand-primary"
                            >
                              {mainPost.category.name}
                            </span>
                          </Link>
                          <Link href={`/${mainPost.category.slug}/${mainPost.slug}`}>
                            <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] mb-3 group-hover:text-gray-200 transition-colors">
                              {mainPost.title}
                            </h1>
                          </Link>
                          {mainPost.excerpt && (
                            <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed line-clamp-2 max-w-2xl hidden sm:block mb-4">
                              {mainPost.excerpt}
                            </p>
                          )}
                          {mainPost.publishedAt && (
                            <span className="text-[11px] font-semibold text-gray-400">
                              {new Date(mainPost.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Secondary Stories 2x2 Grid */}
                    {secondaryPosts.length > 0 && (
                      <div className="lg:col-span-5 grid grid-cols-2 gap-1 bg-white">
                        {secondaryPosts.map((post) => (
                          <article key={post.id} className="group relative overflow-hidden bg-gray-100 min-h-[200px] lg:min-h-[248px]">
                            <Link href={`/${post.category.slug}/${post.slug}`} className="absolute inset-0">
                              {post.featuredImage && (
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-95"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </Link>
                            <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                              <Link href={`/${post.category.slug}`}>
                                <span
                                  className="inline-block text-[9px] font-black uppercase tracking-widest mb-2 px-1.5 py-0.5 bg-brand-primary"
                                >
                                  {post.category.name}
                                </span>
                              </Link>
                              <Link href={`/${post.category.slug}/${post.slug}`}>
                                <h2 className="font-serif font-black text-sm sm:text-base leading-snug group-hover:text-gray-200 transition-colors line-clamp-3">
                                  {post.title}
                                </h2>
                              </Link>
                              {post.publishedAt && (
                                <span className="text-[10px] font-semibold text-gray-400 mt-1.5 block">
                                  {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              case "LatestNews": {
                if (sec.posts.length === 0) return null;
                return (
                  <section key={sec.id} className="mb-10">
                    <div className="flex items-center justify-between border-b border-black mb-6">
                      <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
                        {sec.settings?.title || "Latest News"}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                      {sec.posts.map((post) => (
                        <article key={post.id} className="group flex flex-col border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-all duration-300">
                          <Link href={`/${post.category.slug}/${post.slug}`} className="block overflow-hidden relative">
                            {post.featuredImage ? (
                              <div className="relative overflow-hidden aspect-[16/10]">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-[16/10] bg-gray-100" />
                            )}
                          </Link>
                          <div className="p-4 flex flex-col flex-1 gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/${post.category.slug}`}>
                                <span
                                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white"
                                  style={{ backgroundColor: "var(--brand-primary)" }}
                                >
                                  {post.category.name}
                                </span>
                              </Link>
                              <span className="text-[9px] font-bold text-gray-400">
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                              </span>
                            </div>
                            <Link href={`/${post.category.slug}/${post.slug}`} className="group mt-1">
                              <h3 className="font-serif font-bold text-[19px] leading-[1.2] text-gray-900 group-hover:text-brand-primary transition-colors">
                                {post.title}
                              </h3>
                            </Link>
                            {post.excerpt && (
                              <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2 mt-auto">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              case "CategoryBlock": {
                if (sec.posts.length === 0) return null;
                return (
                  <div key={sec.id}>
                    <CategoryCardRenderer
                      posts={sec.posts}
                      title={sec.settings?.title || sec.posts[0]?.category.name}
                      categorySlug={sec.settings?.categorySlug}
                      style={sec.settings?.cardStyle || "classic"}
                    />
                  </div>
                );
              }

              case "NewsletterSignup": {
                return (
                  <div key={sec.id} className="bg-brand-primary text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="max-w-2xl">
                      <h3 className="font-serif font-black text-3xl md:text-4xl mb-3">
                        Academic rigour, journalistic flair
                      </h3>
                      <p className="text-sm md:text-base font-medium opacity-90">
                        Get the latest insights and analysis delivered straight to your inbox.
                      </p>
                    </div>
                    <form action="/api/newsletter" method="POST" className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Your email address"
                        className="px-4 py-3 text-sm font-semibold text-black outline-none min-w-[250px]"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-black text-white font-extrabold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                );
              }

              case "FeaturedArticles": {
                return (
                  <section key={sec.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
                    {/* Trending list on the left */}
                    {globalTrending.length > 0 && (
                      <div className="lg:col-span-4">
                        <div className="border-b border-black mb-5">
                          <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
                            Top Trending
                          </h3>
                        </div>
                        <div className="flex flex-col divide-y divide-gray-200">
                          {globalTrending.map((post, idx) => (
                            <article key={post.id} className="flex gap-4 py-4 first:pt-0 group hover:bg-gray-50 -mx-2 px-2 transition-colors rounded">
                              <span className="font-sans font-black text-[32px] text-gray-200 leading-none w-8 shrink-0 select-none mt-1 group-hover:text-brand-primary/30 transition-colors">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <Link href={`/${post.category.slug}`}>
                                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary hover:underline">
                                    {post.category.name}
                                  </span>
                                </Link>
                                <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                                  <h4 className="font-serif font-bold text-[17px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors">
                                    {post.title}
                                  </h4>
                                </Link>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">
                                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                                </span>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Curated/Editors Picks on the right */}
                    <div className="lg:col-span-8">
                      <div className="border-b border-black mb-5">
                        <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
                          {sec.settings?.title || "Editor's Picks"}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {sec.posts.map((post) => (
                            <article key={post.id} className="group flex flex-col sm:flex-row gap-4 hover:bg-gray-50 p-2 -m-2 transition-colors rounded">
                            {post.featuredImage && (
                              <Link href={`/${post.category.slug}/${post.slug}`} className="shrink-0 w-full sm:w-32 h-48 sm:h-24 overflow-hidden block relative rounded-sm">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>
                            )}
                            <div className="flex flex-col min-w-0">
                              <Link href={`/${post.category.slug}`}>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary mb-1 block hover:underline">
                                  {post.category.name}
                                </span>
                              </Link>
                              <Link href={`/${post.category.slug}/${post.slug}`} className="group mb-1.5">
                                <h3 className="font-serif font-bold text-[17px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors">
                                  {post.title}
                                </h3>
                              </Link>
                              <span className="text-[10px] font-bold text-gray-400 mt-auto pt-1">
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              }

              case "CollectionBlock": {
                if (sec.posts.length === 0) return null;
                return (
                  <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-subtle">
                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-border-subtle">
                      <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
                        {sec.settings?.title || "Collection"}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                      <div className="lg:col-span-8">
                        {sec.posts[0] && (
                          <article className="group mb-8">
                            <Link href={`/${sec.posts[0].category.slug}/${sec.posts[0].slug}`} className="block overflow-hidden rounded-md relative">
                              {sec.posts[0].featuredImage ? (
                                <div className="relative overflow-hidden aspect-[16/9]">
                                  <img src={sec.posts[0].featuredImage} alt={sec.posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                              ) : (
                                <div className="w-full aspect-[16/9] bg-gray-100" />
                              )}
                            </Link>
                            <div className="mt-4 flex flex-col gap-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Link href={`/${sec.posts[0].category.slug}`}>
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white" style={{ backgroundColor: "var(--brand-primary)" }}>
                                    {sec.posts[0].category.name}
                                  </span>
                                </Link>
                                <span className="text-[10px] font-bold text-gray-400">{sec.posts[0].publishedAt ? new Date(sec.posts[0].publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                              </div>
                              <Link href={`/${sec.posts[0].category.slug}/${sec.posts[0].slug}`} className="group">
                                <h4 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-text-primary group-hover:text-brand-primary transition-colors">
                                  {sec.posts[0].title}
                                </h4>
                              </Link>
                            </div>
                          </article>
                        )}
                        {sec.posts.slice(1, 5).length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border-subtle pt-8">
                            {sec.posts.slice(1, 5).map((post: any) => (
                              <article key={post.id} className="group flex gap-4">
                                <Link href={`/${post.category.slug}/${post.slug}`} className="shrink-0 w-24 h-24 overflow-hidden rounded-md block">
                                  {post.featuredImage ? (
                                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100" />
                                  )}
                                </Link>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                  <Link href={`/${post.category.slug}`}>
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--brand-primary)" }}>
                                      {post.category.name}
                                    </span>
                                  </Link>
                                  <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                                    <h4 className="font-serif font-bold text-sm leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                                      {post.title}
                                    </h4>
                                  </Link>
                                  <span className="text-[10px] font-bold text-gray-400 mt-auto">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                      <aside className="lg:col-span-4">
                        {sec.sidebarPosts && sec.sidebarPosts.length > 0 && (
                          <div className="bg-bg-light/60 border border-border-subtle p-6 rounded-md">
                            <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                              <TrendingUp className="w-4 h-4 text-brand-primary" />
                              <h3 className="font-bold text-xs uppercase tracking-widest text-text-primary">
                                {sec.settings?.sidebarType === "latest" ? "Latest" : sec.settings?.sidebarType === "category" ? "Related" : "Trending"}
                              </h3>
                            </div>
                            <div className="flex flex-col divide-y divide-border-subtle">
                              {sec.sidebarPosts.slice(0, 6).map((post: any, idx: number) => (
                                <article key={post.id} className="flex gap-3 py-3 first:pt-0 last:pb-0 group">
                                  <span className="font-sans font-black text-xl text-gray-200 group-hover:text-brand-primary/30 shrink-0 select-none w-6 text-center">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <Link href={`/${post.category.slug}/${post.slug}`} className="group">
                                      <h4 className="font-bold text-xs leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                                        {post.title}
                                      </h4>
                                    </Link>
                                    <span className="text-[10px] font-bold text-gray-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </div>
                        )}
                      </aside>
                    </div>
                  </section>
                );
              }

              default:
                return null;
            }
          };

          // Find if there is an ad targeting this section ID to render after it
          const matchingAd = activeAds.find((ad) => ad.targetSection === sec.id);

          return (
            <div key={sec.id}>
              {renderSection()}
              {matchingAd && (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
