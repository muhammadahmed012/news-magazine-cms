// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";
    const caption = (formData.get("caption") as string) || "";
    const folderPath = (formData.get("folderPath") as string) || "/";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml",
      "video/mp4", "video/webm",
      "application/pdf",
      "audio/mpeg", "audio/wav",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
    const uniqueName = `${timestamp}-${safeName}`;

    const uploadDir = join(process.cwd(), "public", "uploads", folderPath);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${folderPath}${uniqueName}`.replace(/\/+/g, "/");

    const mediaItem = await db.insert(media).values({
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
      altText: altText || null,
      caption: caption || null,
      folderPath: `/${folderPath}`.replace(/\/+/g, "/"),
    }).returning();

    return NextResponse.json({
      success: true,
      url: fileUrl,
      media: mediaItem[0],
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
