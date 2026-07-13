import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "sidebar_config" } });
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
    await prisma.setting.upsert({
      where: { key: "sidebar_config" },
      update: { value: JSON.stringify(body) },
      create: { key: "sidebar_config", value: JSON.stringify(body) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/sidebar-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
