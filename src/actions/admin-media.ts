// src/actions/admin-media.ts
"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

export async function getMediaLibrary() {
  try {
    const items = await db.select().from(media).orderBy(desc(media.createdAt));
    return { items, success: true };
  } catch (error) {
    console.error("Error fetching media:", error);
    return { items: [], success: false };
  }
}

export async function addMediaItem(data: {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  altText?: string;
  caption?: string;
}) {
  try {
    const result = await db.insert(media).values({
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      altText: data.altText || null,
      caption: data.caption || null,
    }).returning();

    revalidatePath("/admin/media");
    return { success: true, item: result[0] };
  } catch (error) {
    console.error("Error creating media log:", error);
    return { success: false, error: "Failed to add item to Media Library." };
  }
}

export async function deleteMediaItem(id: string) {
  try {
    await db.delete(media).where(eq(media.id, id));
    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    console.error("Error deleting media item:", error);
    return { success: false, error: "Failed to delete item." };
  }
}
