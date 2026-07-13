// src/actions/admin-ads.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AdInput {
  id?: string;
  title: string;
  placement: string;
  type: string;
  code?: string;
  imageUrl?: string;
  targetUrl?: string;
  status: "ACTIVE" | "INACTIVE";
  desktopOnly: boolean;
  mobileOnly: boolean;
}

export async function upsertAd(data: AdInput) {
  try {
    const adData = {
      title: data.title,
      placement: data.placement,
      type: data.type,
      code: data.code || null,
      imageUrl: data.imageUrl || null,
      targetUrl: data.targetUrl || null,
      status: data.status,
      desktopOnly: data.desktopOnly,
      mobileOnly: data.mobileOnly,
    };

    if (data.id) {
      await prisma.ad.update({
        where: { id: data.id },
        data: adData,
      });
    } else {
      await prisma.ad.create({
        data: adData,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/ads");

    return { success: true };
  } catch (error) {
    console.error("Error saving ad:", error);
    return { success: false, error: "Failed to save advertisement configuration." };
  }
}

export async function deleteAd(id: string) {
  try {
    await prisma.ad.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/ads");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ad:", error);
    return { success: false, error: "Failed to delete ad." };
  }
}
