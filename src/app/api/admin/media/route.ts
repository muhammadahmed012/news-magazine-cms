// src/app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });
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
      await prisma.media.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Media API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
