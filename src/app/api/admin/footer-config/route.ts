// src/app/api/admin/footer-config/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

const SETTING_KEY = "footer_config";
const GENERAL_KEY = "general_settings";

async function upsertSetting(key: string, value: string) {
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function GET() {
  try {
    const [footerSetting, generalSetting] = await Promise.all([
      db.select().from(settings).where(eq(settings.key, SETTING_KEY)).then((r) => r[0]),
      db.select().from(settings).where(eq(settings.key, GENERAL_KEY)).then((r) => r[0]),
    ]);

    const footerConfig = footerSetting ? JSON.parse(footerSetting.value) : {};
    const generalConfig = generalSetting ? JSON.parse(generalSetting.value) : {};

    const config = {
      ...footerConfig,
      socialLinks: {
        twitter: generalConfig?.twitterUrl || footerConfig?.socialLinks?.twitter || "",
        facebook: generalConfig?.facebookUrl || footerConfig?.socialLinks?.facebook || "",
        linkedin: generalConfig?.linkedinUrl || footerConfig?.socialLinks?.linkedin || "",
      },
      newsletter: footerConfig?.newsletter || { enabled: true },
    };

    return NextResponse.json(config);
  } catch (err) {
    console.error("GET /api/admin/footer-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const footerData = {
      copyright: body.copyright,
      columns: body.columns,
      newsletter: body.newsletter,
    };

    await upsertSetting(SETTING_KEY, JSON.stringify(footerData));

    const generalSetting = await db.select().from(settings).where(eq(settings.key, GENERAL_KEY)).then((r) => r[0]);
    const generalConfig = generalSetting ? JSON.parse(generalSetting.value) : {};

    const updatedGeneralConfig = {
      ...generalConfig,
      twitterUrl: body.socialLinks?.twitter || "",
      facebookUrl: body.socialLinks?.facebook || "",
      linkedinUrl: body.socialLinks?.linkedin || "",
    };

    await upsertSetting(GENERAL_KEY, JSON.stringify(updatedGeneralConfig));

    revalidatePath("/");
    revalidatePath("/admin/footer");
    revalidatePath("/admin/settings");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/footer-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
