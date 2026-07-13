// src/actions/admin-media.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMediaLibrary() {
  try {
    const items = await prisma.media.findMany({
      orderBy: { createdAt: "desc" }
    });
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
    const item = await prisma.media.create({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        altText: data.altText || null,
        caption: data.caption || null,
      }
    });

    revalidatePath("/admin/media");
    return { success: true, item };
  } catch (error) {
    console.error("Error creating media log:", error);
    return { success: false, error: "Failed to add item to Media Library." };
  }
}

export async function deleteMediaItem(id: string) {
  try {
    await prisma.media.delete({ where: { id } });
    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    console.error("Error deleting media item:", error);
    return { success: false, error: "Failed to delete item." };
  }
}
