// src/app/api/admin/posts/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const postsResult = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        categorySlug: categories.slug,
      })
      .from(posts)
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.status, "PUBLISHED"))
      .orderBy(desc(posts.publishedAt))
      .limit(50);
    return NextResponse.json({ posts: postsResult.map(p => ({ ...p, category: { slug: p.categorySlug } })) });
  } catch (err) {
    console.error("GET /api/admin/posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
