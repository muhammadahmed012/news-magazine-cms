import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const setting = await db.select().from(settings).where(eq(settings.key, "sidebar_config")).then((r) => r[0]);
    return NextResponse.json({ value: setting?.value || "{}" });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const value = JSON.stringify(body);

    const existing = await db.select().from(settings).where(eq(settings.key, "sidebar_config")).limit(1);

    if (existing.length > 0) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, "sidebar_config"));
    } else {
      await db.insert(settings).values({ key: "sidebar_config", value });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/sidebar-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
