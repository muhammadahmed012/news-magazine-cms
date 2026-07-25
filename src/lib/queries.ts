// src/lib/queries.ts
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { posts, categories, ads, settings, postTags, users, tags, comments } from "@/lib/schema";
import { eq, desc, and, or, inArray, lte, gte, sql } from "drizzle-orm";

const POST_SELECT_LIGHT = {
  id: posts.id,
  title: posts.title,
  subtitle: posts.subtitle,
  slug: posts.slug,
  excerpt: posts.excerpt,
  featuredImage: posts.featuredImage,
  status: posts.status,
  publishedAt: posts.publishedAt,
  readingTime: posts.readingTime,
  viewCount: posts.viewCount,
  isFeatured: posts.isFeatured,
  isBreaking: posts.isBreaking,
  isEditorPick: posts.isEditorPick,
  isTrending: posts.isTrending,
  isSponsored: posts.isSponsored,
  isSticky: posts.isSticky,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  authorId: posts.authorId,
  categoryId: posts.categoryId,
  author: {
    name: users.name,
    image: users.image,
  },
  category: {
    name: categories.name,
    slug: categories.slug,
    color: categories.color,
  },
} as const;

const POST_SELECT_FULL = {
  ...POST_SELECT_LIGHT,
  content: posts.content,
  gallery: posts.gallery,
  videoUrl: posts.videoUrl,
  audioUrl: posts.audioUrl,
  seoTitle: posts.seoTitle,
  seoDescription: posts.seoDescription,
  focusKeywords: posts.focusKeywords,
  canonicalUrl: posts.canonicalUrl,
  robotsMeta: posts.robotsMeta,
  schemaType: posts.schemaType,
  structuredData: posts.structuredData,
  author: {
    ...POST_SELECT_LIGHT.author,
    title: users.title,
    image: users.image,
  },
} as const;

export const getPublishedPosts = unstable_cache(
  async (limit: number, offset = 0, categorySlug?: string) => {
    const conditions = [eq(posts.status, "PUBLISHED")];
    if (categorySlug) {
      conditions.push(
        or(
          eq(categories.slug, categorySlug),
          eq(categories.parentId, sql`(SELECT "parentId" FROM "Category" WHERE slug = ${categorySlug})`)
        )!
      );
    }

    return db
      .select(POST_SELECT_FULL)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
  },
  ["published-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getTrendingPosts = unstable_cache(
  async (limit = 6) => {
    return db
      .select(POST_SELECT_LIGHT)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.status, "PUBLISHED"))
      .orderBy(desc(posts.viewCount))
      .limit(limit);
  },
  ["trending-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getHomepageLayout = unstable_cache(
  async () => {
    const [layoutSetting, homepageSettingsRaw] = await Promise.all([
      db.select({ value: settings.value }).from(settings).where(eq(settings.key, "homepage_layout")).then((r) => r[0]),
      db.select({ value: settings.value }).from(settings).where(eq(settings.key, "homepage_settings")).then((r) => r[0]),
    ]);

    const rawLayout = layoutSetting ? JSON.parse(layoutSetting.value) : null;
    let showCategoryBar = true;
    try {
      if (homepageSettingsRaw) {
        const parsed = JSON.parse(homepageSettingsRaw.value);
        showCategoryBar = parsed.showCategoryBar !== false;
      }
    } catch {}

    return { rawLayout, showCategoryBar };
  },
  ["homepage-layout"],
  { revalidate: 300, tags: ["settings"] }
);

export const getCategories = unstable_cache(
  async () => {
    return db
      .select()
      .from(categories)
      .where(sql`${categories.parentId} IS NULL`)
      .orderBy(categories.order)
      .limit(8);
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getHomepageAds = unstable_cache(
  async () => {
    return db
      .select()
      .from(ads)
      .where(and(eq(ads.placement, "HOMEPAGE"), eq(ads.status, "ACTIVE")));
  },
  ["homepage-ads"],
  { revalidate: 300, tags: ["ads"] }
);

export const getHeroPosts = unstable_cache(
  async () => {
    const allPosts = await db
      .select(POST_SELECT_FULL)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.status, "PUBLISHED"))
      .orderBy(desc(posts.isFeatured), desc(posts.publishedAt))
      .limit(5);

    const featured = allPosts.find((p) => p.isFeatured) || allPosts[0];
    const sidePosts = allPosts.filter((p) => p.id !== featured?.id).slice(0, 4);

    return featured ? [featured, ...sidePosts] : sidePosts;
  },
  ["hero-posts"],
  { revalidate: 300, tags: ["posts"] }
);

const getLatestSidebarPosts = unstable_cache(
  async () => {
    return db
      .select(POST_SELECT_LIGHT)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.status, "PUBLISHED"))
      .orderBy(desc(posts.publishedAt))
      .limit(6);
  },
  ["sidebar-latest-posts"],
  { revalidate: 300, tags: ["posts"] }
);

const getCategorySidebarPosts = unstable_cache(
  async (categorySlug: string) => {
    return db
      .select(POST_SELECT_LIGHT)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(eq(posts.status, "PUBLISHED"), eq(categories.slug, categorySlug)))
      .orderBy(desc(posts.publishedAt))
      .limit(6);
  },
  ["sidebar-category-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getSectionPosts = unstable_cache(
  async (
    type: string,
    limit: number,
    categorySlug?: string,
    isEditorPick?: boolean
  ) => {
    const conditions = [eq(posts.status, "PUBLISHED")];
    if (categorySlug) conditions.push(eq(categories.slug, categorySlug));
    if (isEditorPick) conditions.push(eq(posts.isEditorPick, true));

    return db
      .select(POST_SELECT_FULL)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  },
  ["section-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getCategoryPosts = unstable_cache(
  async (categorySlug: string, limit: number) => {
    return db
      .select(POST_SELECT_LIGHT)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(eq(posts.status, "PUBLISHED"), eq(categories.slug, categorySlug)))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  },
  ["category-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export async function getSidebarPosts(type: string, globalTrending: any[], categorySlug?: string) {
  if (type === "trending") return globalTrending;
  if (type === "latest") return getLatestSidebarPosts();
  if (type === "category" && categorySlug) return getCategorySidebarPosts(categorySlug);
  return globalTrending;
}

export const getPostBySlug = cache(async (slug: string) => {
  const result = await db
    .select({
      post: posts,
      author: users,
      category: categories,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.slug, slug))
    .limit(1)
    .then((r) => r[0]);

  if (!result) return null;

  const [postTagsResult, commentsResult] = await Promise.all([
    db
      .select({
        tagId: postTags.tagId,
        tagName: tags.name,
        tagSlug: tags.slug,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, result.post.id)),
    db
      .select({
        id: comments.id,
        content: comments.content,
        status: comments.status,
        postId: comments.postId,
        authorId: comments.authorId,
        guestName: comments.guestName,
        guestEmail: comments.guestEmail,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        authorName: users.name,
        authorImage: users.image,
        authorRole: users.role,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(and(eq(comments.postId, result.post.id), eq(comments.status, "APPROVED")))
      .orderBy(desc(comments.createdAt)),
  ]);

  return {
    ...result.post,
    author: result.author,
    category: result.category,
    tags: postTagsResult.map((pt) => ({ id: pt.tagId, name: pt.tagName, slug: pt.tagSlug })),
    comments: commentsResult.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      postId: c.postId,
      authorId: c.authorId,
      guestName: c.guestName,
      guestEmail: c.guestEmail,
      parentId: c.parentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: c.authorName
        ? { name: c.authorName, image: c.authorImage, role: c.authorRole }
        : null,
    })),
  };
});

export async function getRelatedPosts(categoryId: string, postId: string) {
  return db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.categoryId, categoryId),
        sql`${posts.id} != ${postId}`,
        eq(posts.status, "PUBLISHED")
      )
    )
    .limit(3)
    .orderBy(desc(posts.publishedAt));
}

const PLACEMENTS = [
  "SIDEBAR",
  "ABOVE_HEADING",
  "BELOW_HEADING",
  "AFTER_PARA_1",
  "AFTER_PARA_2",
  "AFTER_PARA_3",
  "START_OF_ARTICLE",
  "END_OF_ARTICLE",
] as const;

export const getAdByPlacement = unstable_cache(
  async (placement: string) => {
    try {
      const [ad] = await db
        .select()
        .from(ads)
        .where(and(eq(ads.status, "ACTIVE"), eq(ads.placement, placement)))
        .orderBy(desc(ads.createdAt))
        .limit(1);
      return ad ?? null;
    } catch (error) {
      console.error(`[queries] getAdByPlacement(${placement}) error:`, error);
      return null;
    }
  },
  ["ad-placement"],
  { revalidate: 300, tags: ["ads"] }
);

export const getPostPageData = unstable_cache(
  async () => {
    const [allAds, sidebarConfig, footerConfig, trendingPosts, latestPosts] = await Promise.all([
      db
        .select()
        .from(ads)
        .where(and(inArray(ads.placement, [...PLACEMENTS]), eq(ads.status, "ACTIVE"))),
      db.select({ value: settings.value }).from(settings).where(eq(settings.key, "sidebar_config")).then((r) => r[0]),
      db.select({ value: settings.value }).from(settings).where(eq(settings.key, "footer_config")).then((r) => r[0]),
      db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          viewCount: posts.viewCount,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          categorySlug: categories.slug,
          categoryName: categories.name,
        })
        .from(posts)
        .innerJoin(categories, eq(posts.categoryId, categories.id))
        .where(eq(posts.status, "PUBLISHED"))
        .orderBy(desc(posts.viewCount))
        .limit(5),
      db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          categorySlug: categories.slug,
          categoryName: categories.name,
        })
        .from(posts)
        .innerJoin(categories, eq(posts.categoryId, categories.id))
        .where(eq(posts.status, "PUBLISHED"))
        .orderBy(desc(posts.publishedAt))
        .limit(5),
    ]);

    const adMap = new Map(allAds.map((ad) => [ad.placement, ad]));

    return {
      sidebarAd: adMap.get("SIDEBAR") || null,
      aboveHeadingAd: adMap.get("ABOVE_HEADING") || null,
      belowHeadingAd: adMap.get("BELOW_HEADING") || null,
      afterPara1Ad: adMap.get("AFTER_PARA_1") || null,
      afterPara2Ad: adMap.get("AFTER_PARA_2") || null,
      afterPara3Ad: adMap.get("AFTER_PARA_3") || null,
      startOfArticleAd: adMap.get("START_OF_ARTICLE") || null,
      endOfArticleAd: adMap.get("END_OF_ARTICLE") || null,
      sidebarConfig,
      footerConfig,
      trendingPosts,
      latestPosts,
    };
  },
  ["post-page-data"],
  { revalidate: 300, tags: ["ads", "settings", "posts"] }
);
