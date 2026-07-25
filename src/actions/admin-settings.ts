// src/actions/admin-settings.ts
"use server";

import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveSetting(key: string, value: string) {
  try {
    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);

    if (existing.length > 0) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }

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
