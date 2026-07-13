// src/actions/admin-settings.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveSetting(key: string, value: string) {
  try {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    // Revalidate paths that consume settings
    revalidatePath("/");
    revalidatePath("/admin/theme");
    revalidatePath("/admin/homepage");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error);
    return { success: false, error: "Failed to save configuration." };
  }
}
