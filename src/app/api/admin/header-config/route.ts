// src/app/api/admin/header-config/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SETTING_KEY = "header_config";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
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

    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      create: { key: SETTING_KEY, value: JSON.stringify(body) },
      update: { value: JSON.stringify(body) },
    });

    revalidatePath("/");
    revalidatePath("/admin/menus");
    revalidatePath("/admin/header");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/header-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
