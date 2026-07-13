// src/app/api/admin/footer-config/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SETTING_KEY = "footer_config";
const GENERAL_KEY = "general_settings";

export async function GET() {
  try {
    const [footerSetting, generalSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: SETTING_KEY } }),
      prisma.setting.findUnique({ where: { key: GENERAL_KEY } }),
    ]);

    const footerConfig = footerSetting ? JSON.parse(footerSetting.value) : {};
    const generalConfig = generalSetting ? JSON.parse(generalSetting.value) : {};

    // Merge social links from general_settings
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

    // 1. Save footer configuration (copyright, columns, newsletter)
    const footerData = {
      copyright: body.copyright,
      columns: body.columns,
      newsletter: body.newsletter,
    };

    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      create: { key: SETTING_KEY, value: JSON.stringify(footerData) },
      update: { value: JSON.stringify(footerData) },
    });

    // 2. Save social links to general_settings to keep it unified
    const generalSetting = await prisma.setting.findUnique({ where: { key: GENERAL_KEY } });
    const generalConfig = generalSetting ? JSON.parse(generalSetting.value) : {};

    const updatedGeneralConfig = {
      ...generalConfig,
      twitterUrl: body.socialLinks?.twitter || "",
      facebookUrl: body.socialLinks?.facebook || "",
      linkedinUrl: body.socialLinks?.linkedin || "",
    };

    await prisma.setting.upsert({
      where: { key: GENERAL_KEY },
      create: { key: GENERAL_KEY, value: JSON.stringify(updatedGeneralConfig) },
      update: { value: JSON.stringify(updatedGeneralConfig) },
    });

    revalidatePath("/");
    revalidatePath("/admin/footer");
    revalidatePath("/admin/settings");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/footer-config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
