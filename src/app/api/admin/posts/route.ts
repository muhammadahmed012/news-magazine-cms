// src/app/api/admin/posts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, category: { select: { slug: true } } },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("GET /api/admin/posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
