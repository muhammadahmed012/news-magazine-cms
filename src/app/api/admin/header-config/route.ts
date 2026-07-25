// src/app/api/admin/header-config/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

const SETTING_KEY = "header_config";

export async function GET() {
  try {
    const setting = await db.select().from(settings).where(eq(settings.key, SETTING_KEY)).then((r) => r[0]);
    const config = setting ? JSON.parse(setting.value) : {};
    return NextResponse.json(config);
  } catch (err) {
    console.error("GET /api/admin/header-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const value = JSON.stringify(body);

    const existing = await db.select().from(settings).where(eq(settings.key, SETTING_KEY)).limit(1);

    if (existing.length > 0) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, SETTING_KEY));
    } else {
      await db.insert(settings).values({ key: SETTING_KEY, value });
    }

    revalidatePath("/");
    revalidatePath("/admin/menus");
    revalidatePath("/admin/header");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/header-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
