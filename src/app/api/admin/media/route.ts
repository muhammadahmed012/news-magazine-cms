// src/app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db.select().from(media).orderBy(desc(media.createdAt));
    return NextResponse.json({ items, success: true });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ items: [], success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body._action === "delete" && body.id) {
      await db.delete(media).where(eq(media.id, body.id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Media API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
