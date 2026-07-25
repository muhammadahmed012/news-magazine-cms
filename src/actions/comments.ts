// src/actions/comments.ts
"use server";

import { db } from "@/lib/db";
import { comments, posts, categories } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export interface CreateCommentParams {
  postId: string;
  content: string;
  guestName?: string;
  guestEmail?: string;
  authorId?: string;
  parentId?: string;
}

export async function createComment(params: CreateCommentParams) {
  const { postId, content, guestName, guestEmail, authorId, parentId } = params;

  if (!postId || !content.trim()) {
    return { success: false, error: "Post ID and content are required." };
  }

  try {
    const comment = await db.insert(comments).values({
      content: content.trim(),
      postId,
      parentId: parentId || null,
      status: "APPROVED",
      authorId: authorId || null,
      guestName: authorId ? null : guestName || "Anonymous",
      guestEmail: authorId ? null : guestEmail || "guest@example.com",
    }).returning();

    const postResult = await db
      .select({ slug: posts.slug, categorySlug: categories.slug })
      .from(posts)
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.id, postId))
      .limit(1);

    const post = postResult[0];

    if (post) {
      revalidatePath(`/${post.categorySlug}/${post.slug}`);
    }

    return { success: true, comment: comment[0] };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to submit comment." };
  }
}
