// src/actions/posts.ts
"use server";

import { prisma } from "@/lib/db";

export interface GetPostsParams {
  categorySlug?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isEditorPick?: boolean;
  isTrending?: boolean;
  isSponsored?: boolean;
  limit?: number;
  offset?: number;
}

export async function getPosts(params: GetPostsParams = {}) {
  const {
    categorySlug,
    isFeatured,
    isBreaking,
    isEditorPick,
    isTrending,
    isSponsored,
    limit = 6,
    offset = 0,
  } = params;

  try {
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (categorySlug) {
      whereClause.category = {
        OR: [
          { slug: categorySlug },
          { parent: { slug: categorySlug } }
        ]
      };
    }

    if (isFeatured !== undefined) whereClause.isFeatured = isFeatured;
    if (isBreaking !== undefined) whereClause.isBreaking = isBreaking;
    if (isEditorPick !== undefined) whereClause.isEditorPick = isEditorPick;
    if (isTrending !== undefined) whereClause.isTrending = isTrending;
    if (isSponsored !== undefined) whereClause.isSponsored = isSponsored;

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return { posts, success: true };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], success: false };
  }
}

export async function incrementPostViews(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error incrementing post views:", error);
    return { success: false };
  }
}
