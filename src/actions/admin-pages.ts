"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPage(data: any) {
  try {
    const page = await prisma.page.create({
      data: {
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
      },
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true, pageId: page.id };
  } catch (error: any) {
    console.error("Error creating page:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePage(id: string, data: any) {
  try {
    const page = await prisma.page.update({
      where: { id },
      data: {
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
      },
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating page:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePage(id: string) {
  try {
    const page = await prisma.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting page:", error);
    return { success: false, error: error.message };
  }
}
