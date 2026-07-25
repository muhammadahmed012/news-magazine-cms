"use server";

import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPage(data: any) {
  try {
    const result = await db.insert(pages).values({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      status: data.status,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      focusKeywords: data.focusKeywords,
      canonicalUrl: data.canonicalUrl,
      robotsMeta: data.robotsMeta,
      schemaType: data.schemaType,
      structuredData: data.structuredData,
      authorId: data.authorId,
    }).returning();
    revalidatePath("/admin/pages");
    revalidatePath(`/${data.slug}`);
    return { success: true, pageId: result[0].id };
  } catch (error: any) {
    console.error("Error creating page:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePage(id: string, data: any) {
  try {
    await db.update(pages).set({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      status: data.status,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      focusKeywords: data.focusKeywords,
      canonicalUrl: data.canonicalUrl,
      robotsMeta: data.robotsMeta,
      schemaType: data.schemaType,
      structuredData: data.structuredData,
    }).where(eq(pages.id, id));
    revalidatePath("/admin/pages");
    revalidatePath(`/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating page:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePage(id: string) {
  try {
    const deleted = await db.delete(pages).where(eq(pages.id, id)).returning();
    revalidatePath("/admin/pages");
    if (deleted[0]) revalidatePath(`/${deleted[0].slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting page:", error);
    return { success: false, error: error.message };
  }
}
