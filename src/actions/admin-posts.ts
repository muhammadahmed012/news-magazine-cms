// src/actions/admin-posts.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
      // 1. Fetch old post for revision logic
      const oldPost = await prisma.post.findUnique({
        where: { id: data.id }
      });

      // 2. Perform Update
      post = await prisma.post.update({
        where: { id: data.id },
        data: {
          ...postData,
          ...(data.tagIds ? { tags: { set: data.tagIds.map(id => ({ id })) } } : {}),
        },
        include: { category: true }
      });

      // 3. Save a revision if content changed
      if (oldPost && (oldPost.content !== data.content || oldPost.title !== data.title)) {
        await prisma.revision.create({
          data: {
            postId: post.id,
            title: oldPost.title,
            content: oldPost.content,
            excerpt: oldPost.excerpt
          }
        });
      }
    } else {
      // Perform Create
      post = await prisma.post.create({
        data: {
          ...postData,
          ...(data.tagIds && data.tagIds.length > 0 ? { tags: { connect: data.tagIds.map(id => ({ id })) } } : {}),
        },
        include: { category: true }
      });
    }

    // Revalidate public page paths to ensure readers see changes
    revalidatePath("/");
    revalidatePath(`/${post.category.slug}`);
    revalidatePath(`/${post.category.slug}/${post.slug}`);
    revalidatePath("/admin/posts");

    return { success: true, post };
  } catch (error: any) {
    console.error("Error saving post:", error);
    if (error.code === "P2002") {
      return { success: false, error: "The slug matches another existing post. Slugs must be unique." };
    }
    return { success: false, error: "Failed to save post." };
  }
}

export async function deletePost(id: string) {
  try {
    const post = await prisma.post.delete({
      where: { id },
      include: { category: true }
    });

    revalidatePath("/");
    revalidatePath(`/${post.category.slug}`);
    revalidatePath("/admin/posts");

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post." };
  }
}
