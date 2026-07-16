// src/lib/settings.ts
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getSetting = unstable_cache(
  async (key: string) => {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });
      return setting ? JSON.parse(setting.value) : null;
    } catch (error) {
      console.error(`Error loading setting ${key}:`, error);
      return null;
    }
  },
  ["setting"],
  { revalidate: 300, tags: ["settings"] }
);
