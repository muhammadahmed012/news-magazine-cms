// src/actions/admin-posts.ts
"use server";

import { db } from "@/lib/db";
import { posts, categories, postTags, revisions } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";

export interface PostInput {
  id?: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishedAt?: Date | string | null;
  readingTime: number;
  authorId: string;
  categoryId: string;
  isFeatured: boolean;
  isBreaking: boolean;
  isEditorPick: boolean;
  isTrending: boolean;
  isSponsored: boolean;
  isSticky: boolean;
  seoTitle?: string;
  seoDescription?: string;
  focusKeywords?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  schemaType: string;
  tagIds?: string[];
}

export async function upsertPost(data: PostInput) {
  try {
    const postData = {
      title: data.title,
      subtitle: data.subtitle || null,
      slug: data.slug.toLowerCase().trim(),
      excerpt: data.excerpt || null,
      content: data.content,
      featuredImage: data.featuredImage || null,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : data.publishedAt ? new Date(data.publishedAt) : null,
      readingTime: data.readingTime || 5,
      authorId: data.authorId,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      isBreaking: data.isBreaking,
      isEditorPick: data.isEditorPick,
      isTrending: data.isTrending,
      isSponsored: data.isSponsored,
      isSticky: data.isSticky,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      focusKeywords: data.focusKeywords || null,
      canonicalUrl: data.canonicalUrl || null,
      robotsMeta: data.robotsMeta || "index, follow",
      schemaType: data.schemaType || "NewsArticle",
    };

    let post;
    if (data.id) {
      const oldPost = await db.select().from(posts).where(eq(posts.id, data.id)).then((r) => r[0]);

      post = await db.update(posts).set(postData).where(eq(posts.id, data.id)).returning();

      if (data.tagIds) {
        await db.delete(postTags).where(eq(postTags.postId, data.id!));
        if (data.tagIds.length > 0) {
          await db.insert(postTags).values(
            data.tagIds.map((tagId) => ({ postId: data.id!, tagId }))
          );
        }
      }

      const updatedPost = post[0];

      if (oldPost && (oldPost.content !== data.content || oldPost.title !== data.title)) {
        await db.insert(revisions).values({
          postId: updatedPost.id,
          title: oldPost.title,
          content: oldPost.content,
          excerpt: oldPost.excerpt,
        });
      }

      const categoryResult = await db
        .select({ slug: categories.slug })
        .from(categories)
        .where(eq(categories.id, updatedPost.categoryId))
        .limit(1);
      const categorySlug = categoryResult[0]?.slug || "";

      revalidatePath("/");
      revalidatePath(`/${categorySlug}`);
      revalidatePath(`/${categorySlug}/${updatedPost.slug}`);
      revalidatePath("/admin/posts");

      return { success: true, post: updatedPost };
    } else {
      const newPost = await db.insert(posts).values(postData).returning();

      if (data.tagIds && data.tagIds.length > 0) {
        await db.insert(postTags).values(
          data.tagIds.map((tagId) => ({ postId: newPost[0].id, tagId }))
        );
      }

      const insertedPost = newPost[0];

      const categoryResult = await db
        .select({ slug: categories.slug })
        .from(categories)
        .where(eq(categories.id, insertedPost.categoryId))
        .limit(1);
      const categorySlug = categoryResult[0]?.slug || "";

      revalidatePath("/");
      revalidatePath(`/${categorySlug}`);
      revalidatePath(`/${categorySlug}/${insertedPost.slug}`);
      revalidatePath("/admin/posts");

      return { success: true, post: insertedPost };
    }
  } catch (error: any) {
    console.error("Error saving post:", error);
    if (error?.code === "23505") {
      return { success: false, error: "The slug matches another existing post. Slugs must be unique." };
    }
    return { success: false, error: "Failed to save post." };
  }
}

export async function deletePost(id: string) {
  try {
    const postResult = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    const deletedPost = postResult[0];
    if (!deletedPost) {
      return { success: false, error: "Post not found." };
    }

    const categoryResult = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, deletedPost.categoryId))
      .limit(1);
    const categorySlug = categoryResult[0]?.slug || "";

    revalidatePath("/");
    revalidatePath(`/${categorySlug}`);
    revalidatePath("/admin/posts");

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post." };
  }
}
