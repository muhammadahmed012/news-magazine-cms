// src/app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const categoriesResult = await db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories)
      .orderBy(asc(categories.order));
    return NextResponse.json({ categories: categoriesResult });
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
