// src/lib/settings.ts
import { prisma } from "@/lib/db";
import { cache } from "react";

export const getSetting = cache(async (key: string) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting ? JSON.parse(setting.value) : null;
  } catch (error) {
    console.error(`Error loading setting ${key}:`, error);
    return null;
  }
});
