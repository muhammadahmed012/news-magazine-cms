// src/lib/queries.ts
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { posts, categories, ads, settings, postTags, users, tags, comments } from "@/lib/schema";
import { eq, desc, and, or, lt, lte, gte, sql } from "drizzle-orm";

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

    const results = await db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImage: posts.featuredImage,
        gallery: posts.gallery,
        videoUrl: posts.videoUrl,
        audioUrl: posts.audioUrl,
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
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        focusKeywords: posts.focusKeywords,
        canonicalUrl: posts.canonicalUrl,
        robotsMeta: posts.robotsMeta,
        schemaType: posts.schemaType,
        structuredData: posts.structuredData,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        author: {
          name: users.name,
          title: users.title,
          image: users.image,
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);

    return results;
  },
  ["published-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getTrendingPosts = unstable_cache(
  async (limit = 6) => {
    return db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
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
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
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
      db.select().from(settings).where(eq(settings.key, "homepage_layout")).then((r) => r[0]),
      db.select().from(settings).where(eq(settings.key, "homepage_settings")).then((r) => r[0]),
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
    const featured = await db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImage: posts.featuredImage,
        gallery: posts.gallery,
        videoUrl: posts.videoUrl,
        audioUrl: posts.audioUrl,
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
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        focusKeywords: posts.focusKeywords,
        canonicalUrl: posts.canonicalUrl,
        robotsMeta: posts.robotsMeta,
        schemaType: posts.schemaType,
        structuredData: posts.structuredData,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        author: {
          name: users.name,
          title: users.title,
          image: users.image,
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(eq(posts.status, "PUBLISHED"), eq(posts.isFeatured, true)))
      .orderBy(desc(posts.publishedAt))
      .limit(1)
      .then((r) => r[0]);

    const sidePosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImage: posts.featuredImage,
        gallery: posts.gallery,
        videoUrl: posts.videoUrl,
        audioUrl: posts.audioUrl,
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
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        focusKeywords: posts.focusKeywords,
        canonicalUrl: posts.canonicalUrl,
        robotsMeta: posts.robotsMeta,
        schemaType: posts.schemaType,
        structuredData: posts.structuredData,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        author: {
          name: users.name,
          title: users.title,
          image: users.image,
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(
        and(
          eq(posts.status, "PUBLISHED"),
          featured ? sql`${posts.id} != ${featured.id}` : sql`1=1`
        )
      )
      .orderBy(desc(posts.publishedAt))
      .limit(4);

    return featured ? [featured, ...sidePosts] : sidePosts;
  },
  ["hero-posts"],
  { revalidate: 300, tags: ["posts"] }
);

const getLatestSidebarPosts = unstable_cache(
  async () => {
    return db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
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
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
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
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
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
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
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
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImage: posts.featuredImage,
        gallery: posts.gallery,
        videoUrl: posts.videoUrl,
        audioUrl: posts.audioUrl,
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
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        focusKeywords: posts.focusKeywords,
        canonicalUrl: posts.canonicalUrl,
        robotsMeta: posts.robotsMeta,
        schemaType: posts.schemaType,
        structuredData: posts.structuredData,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        author: {
          name: users.name,
          title: users.title,
          image: users.image,
        },
        category: {
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        },
      })
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

  const postTagsResult = await db
    .select({
      tagId: postTags.tagId,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, result.post.id));

  const commentsResult = await db
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
    .orderBy(desc(comments.createdAt));

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

export const getAllActiveAds = unstable_cache(
  async () => {
    return db.select().from(ads).where(eq(ads.status, "ACTIVE"));
  },
  ["all-active-ads"],
  { revalidate: 300, tags: ["ads"] }
);

export const getAdByPlacement = unstable_cache(
  async (placement: string) => {
    try {
      const now = new Date();
      const result = await db
        .select()
        .from(ads)
        .where(
          and(
            eq(ads.placement, placement),
            eq(ads.status, "ACTIVE"),
            or(
              sql`${ads.startDate} IS NULL`,
              lte(ads.startDate, now)
            )!,
            or(
              sql`${ads.endDate} IS NULL`,
              gte(ads.endDate, now)
            )!
          )
        )
        .orderBy(ads.impressions)
        .limit(1)
        .then((r) => r[0]);
      return result || null;
    } catch {
      return null;
    }
  },
  ["ad-by-placement"],
  { revalidate: 300, tags: ["ads"] }
);

export const getPostPageData = unstable_cache(
  async () => {
    return Promise.all([
      db.select().from(ads).where(and(eq(ads.placement, "SIDEBAR"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "ABOVE_HEADING"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "BELOW_HEADING"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "AFTER_PARA_1"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "AFTER_PARA_2"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "AFTER_PARA_3"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "START_OF_ARTICLE"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(ads).where(and(eq(ads.placement, "END_OF_ARTICLE"), eq(ads.status, "ACTIVE"))).then((r) => r[0]),
      db.select().from(settings).where(eq(settings.key, "sidebar_config")).then((r) => r[0]),
      db.select().from(settings).where(eq(settings.key, "footer_config")).then((r) => r[0]),
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
  },
  ["post-page-data"],
  { revalidate: 300, tags: ["ads", "settings", "posts"] }
);
