import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json({ tags });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body._action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
      await prisma.tag.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    const { name } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim(), slug },
    });

    return NextResponse.json({ success: true, tag });
  } catch (err) {
    console.error("POST /api/admin/tags error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
