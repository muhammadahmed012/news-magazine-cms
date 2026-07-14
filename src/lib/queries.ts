// src/lib/queries.ts
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const postInclude = {
  author: { select: { name: true, title: true, image: true } },
  category: { select: { name: true, slug: true, color: true } },
} as const;

const postIncludeMinimal = {
  author: { select: { name: true } },
  category: { select: { name: true, slug: true, color: true } },
} as const;

export const getPublishedPosts = unstable_cache(
  async (limit: number, offset = 0, categorySlug?: string) => {
    const where: any = { status: "PUBLISHED" };
    if (categorySlug) {
      where.category = {
        OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }],
      };
    }
    return prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
      include: postInclude,
    });
  },
  ["published-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getTrendingPosts = unstable_cache(
  async (limit = 6) => {
    return prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: limit,
      include: postIncludeMinimal,
    });
  },
  ["trending-posts"],
  { revalidate: 300, tags: ["posts"] }
);

export const getHomepageLayout = unstable_cache(
  async () => {
    const [layoutSetting, homepageSettingsRaw] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "homepage_layout" } }),
      prisma.setting.findUnique({ where: { key: "homepage_settings" } }),
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
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      take: 8,
    });
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getHomepageAds = unstable_cache(
  async () => {
    return prisma.ad.findMany({
      where: { placement: "HOMEPAGE", status: "ACTIVE" },
    });
  },
  ["homepage-ads"],
  { revalidate: 300, tags: ["ads"] }
);

export async function getHeroPosts() {
  const featured = await prisma.post.findFirst({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { publishedAt: "desc" },
    include: postInclude,
  });
  const sidePosts = await prisma.post.findMany({
    where: { status: "PUBLISHED", id: featured ? { not: featured.id } : undefined },
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: postInclude,
  });
  return featured ? [featured, ...sidePosts] : sidePosts;
}

export async function getSectionPosts(
  type: string,
  limit: number,
  categorySlug?: string,
  isEditorPick?: boolean
) {
  const where: any = { status: "PUBLISHED" };
  if (categorySlug) where.category = { slug: categorySlug };
  if (isEditorPick) where.isEditorPick = true;

  return prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: postInclude,
  });
}

export async function getSidebarPosts(type: string, globalTrending: any[], categorySlug?: string) {
  if (type === "trending") return globalTrending;
  if (type === "latest") {
    return prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: postIncludeMinimal,
    });
  }
  if (type === "category" && categorySlug) {
    return prisma.post.findMany({
      where: { status: "PUBLISHED", category: { slug: categorySlug } },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: postIncludeMinimal,
    });
  }
  return globalTrending;
}

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      tags: { select: { id: true, name: true, slug: true } },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true, image: true, role: true } },
        },
      },
    },
  });
});

export async function getRelatedPosts(categoryId: string, postId: string) {
  return prisma.post.findMany({
    where: { categoryId, id: { not: postId }, status: "PUBLISHED" },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostPageData() {
  return Promise.all([
    prisma.ad.findFirst({ where: { placement: "SIDEBAR", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "ABOVE_HEADING", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "BELOW_HEADING", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "AFTER_PARA_1", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "AFTER_PARA_2", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "AFTER_PARA_3", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "START_OF_ARTICLE", status: "ACTIVE" } }),
    prisma.ad.findFirst({ where: { placement: "END_OF_ARTICLE", status: "ACTIVE" } }),
    prisma.setting.findUnique({ where: { key: "sidebar_config" } }),
    prisma.setting.findUnique({ where: { key: "footer_config" } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 5,
      include: { category: { select: { slug: true, name: true } } },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { category: { select: { slug: true, name: true } } },
    }),
  ]);
}
