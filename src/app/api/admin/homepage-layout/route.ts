// src/app/api/admin/homepage-layout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SETTING_KEY = "homepage_layout";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [setting, categories] = await Promise.all([
      prisma.setting.findUnique({ where: { key: SETTING_KEY } }),
      prisma.category.findMany({
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const layout = setting ? JSON.parse(setting.value) : [];

    return NextResponse.json({ layout, categories });
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

    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      create: { key: SETTING_KEY, value: JSON.stringify(layout) },
      update: { value: JSON.stringify(layout) },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/homepage-layout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
