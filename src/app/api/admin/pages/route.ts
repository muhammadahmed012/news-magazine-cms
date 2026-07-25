// src/app/api/admin/pages/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const pagesResult = await db
      .select({ id: pages.id, title: pages.title, slug: pages.slug })
      .from(pages)
      .where(eq(pages.status, "PUBLISHED"));
    return NextResponse.json({ pages: pagesResult });
  } catch (err) {
    console.error("GET /api/admin/pages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
