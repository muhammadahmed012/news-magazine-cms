// src/app/api/admin/ads/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ads });
  } catch (err) {
    console.error("GET /api/admin/ads error:", err);
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
      await prisma.ad.delete({ where: { id } });
      revalidatePath("/");
      revalidatePath("/admin/ads");
      return NextResponse.json({ success: true });
    }

    const { title, placement, type, code, imageUrl, targetUrl, status, desktopOnly, mobileOnly, targetSection } = body;

    if (!title || !placement) {
      return NextResponse.json({ error: "Title and placement are required" }, { status: 400 });
    }

    await prisma.ad.create({
      data: {
        title,
        placement,
        type: type || "IMAGE",
        code: code || null,
        imageUrl: imageUrl || null,
        targetUrl: targetUrl || null,
        status: status || "ACTIVE",
        desktopOnly: desktopOnly || false,
        mobileOnly: mobileOnly || false,
        targetSection: targetSection || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/ads");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/ads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, title, placement, type, code, imageUrl, targetUrl, status, desktopOnly, mobileOnly, targetSection } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.ad.update({
      where: { id },
      data: {
        title,
        placement,
        type,
        code: code || null,
        imageUrl: imageUrl || null,
        targetUrl: targetUrl || null,
        status,
        desktopOnly: desktopOnly || false,
        mobileOnly: mobileOnly || false,
        targetSection: targetSection || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/ads");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/ads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.ad.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin/ads");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/ads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
