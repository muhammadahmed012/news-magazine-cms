// src/actions/comments.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    // If authorId is passed, connect to User, else save as guest
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        parentId,
        status: "APPROVED", // Auto approve for demo, can be toggled by mod
        authorId: authorId || undefined,
        guestName: authorId ? undefined : guestName || "Anonymous",
        guestEmail: authorId ? undefined : guestEmail || "guest@example.com",
      },
    });

    // Revalidate the post page path to show the new comment instantly
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { slug: true, category: { select: { slug: true } } },
    });

    if (post) {
      revalidatePath(`/${post.category.slug}/${post.slug}`);
    }

    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to submit comment." };
  }
}
