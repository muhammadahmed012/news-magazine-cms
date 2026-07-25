import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags, postTags } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, desc, asc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const tagsResult = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        createdAt: tags.createdAt,
        postCount: sql<number>`count(${postTags.postId})::int`,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .groupBy(tags.id, tags.name, tags.slug, tags.createdAt)
      .orderBy(asc(tags.name));
    return NextResponse.json({ tags: tagsResult });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body._action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
      await db.delete(tags).where(eq(tags.id, id));
      return NextResponse.json({ success: true });
    }

    const { name } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const existing = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 400 });
    }

    const result = await db.insert(tags).values({ name: name.trim(), slug }).returning();

    return NextResponse.json({ success: true, tag: result[0] });
  } catch (err) {
    console.error("POST /api/admin/tags error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
