// src/app/api/admin/homepage-layout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings, categories } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";

const SETTING_KEY = "homepage_layout";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [setting, cats] = await Promise.all([
      db.select().from(settings).where(eq(settings.key, SETTING_KEY)).then((r) => r[0]),
      db.select({ name: categories.name, slug: categories.slug }).from(categories).orderBy(asc(categories.name)),
    ]);

    const layout = setting ? JSON.parse(setting.value) : [];

    return NextResponse.json({ layout, categories: cats });
  } catch (err) {
    console.error("GET /api/admin/homepage-layout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { layout } = body;

    if (!Array.isArray(layout)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const existing = await db.select().from(settings).where(eq(settings.key, SETTING_KEY)).limit(1);
    const value = JSON.stringify(layout);

    if (existing.length > 0) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, SETTING_KEY));
    } else {
      await db.insert(settings).values({ key: SETTING_KEY, value });
    }

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/homepage-layout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
