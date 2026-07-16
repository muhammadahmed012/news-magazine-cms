// src/app/api/newsletter/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const formData = await req.formData();
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    await prisma.newsletterSubscriber.upsert({
      where: { email: sanitizedEmail },
      create: { email: sanitizedEmail, active: true },
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
