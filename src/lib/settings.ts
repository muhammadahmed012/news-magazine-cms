// src/lib/settings.ts
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getSetting = unstable_cache(
  async (key: string) => {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);
      return result[0] ? JSON.parse(result[0].value) : null;
    } catch (error) {
      console.error(`Error loading setting ${key}:`, error);
      return null;
    }
  },
  ["setting"],
  { revalidate: 300, tags: ["settings"] }
);
