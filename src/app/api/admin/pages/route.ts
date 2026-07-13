// src/app/api/admin/pages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true },
    });
    return NextResponse.json({ pages });
  } catch (err) {
    console.error("GET /api/admin/pages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
