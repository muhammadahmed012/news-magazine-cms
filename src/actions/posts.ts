// src/actions/posts.ts
"use server";

import { db } from "@/lib/db";
import { posts, users, categories, postTags, tags } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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
    const conditions: any[] = [eq(posts.status, "PUBLISHED")];

    if (categorySlug) {
      conditions.push(eq(categories.slug, categorySlug));
    }
    if (isFeatured !== undefined) conditions.push(eq(posts.isFeatured, isFeatured));
    if (isBreaking !== undefined) conditions.push(eq(posts.isBreaking, isBreaking));
    if (isEditorPick !== undefined) conditions.push(eq(posts.isEditorPick, isEditorPick));
    if (isTrending !== undefined) conditions.push(eq(posts.isTrending, isTrending));
    if (isSponsored !== undefined) conditions.push(eq(posts.isSponsored, isSponsored));

    const postsResult = await db
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
          id: users.id,
          name: users.name,
          image: users.image,
          title: users.title,
        },
        category: {
          id: categories.id,
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
      .limit(limit)
      .offset(offset);

    const postsWithTags = await Promise.all(
      postsResult.map(async (post) => {
        const postTagsResult = await db
          .select({ name: tags.name, slug: tags.slug })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, post.id));
        return { ...post, tags: postTagsResult };
      })
    );

    return { posts: postsWithTags, success: true };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], success: false };
  }
}

export async function incrementPostViews(postId: string) {
  try {
    await db
      .update(posts)
      .set({ viewCount: sql`${posts.viewCount} + 1` })
      .where(eq(posts.id, postId));
    return { success: true };
  } catch (error) {
    console.error("Error incrementing post views:", error);
    return { success: false };
  }
}
