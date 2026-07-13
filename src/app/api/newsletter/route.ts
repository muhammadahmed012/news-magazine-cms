// src/app/api/newsletter/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, active: true },
      update: { active: true },
    });

    return NextResponse.redirect(new URL("/?subscribed=1", req.url), { status: 303 });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.redirect(new URL("/?subscribed=error", req.url), { status: 303 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
