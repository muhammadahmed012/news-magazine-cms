// src/actions/admin-users.ts
"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const bio = formData.get("bio") as string;
  const title = formData.get("title") as string;

  if (!name || !email || !password) return;

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return;

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: role || "CONTRIBUTOR",
      bio: bio || null,
      title: title || null,
    });
  } catch (e) {
    console.error("createUser error:", e);
  }
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const id = formData.get("userId") as string;
  if (!id) return;
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (e) {
    console.error("deleteUser error:", e);
  }
  revalidatePath("/admin/users");
}

export async function changePassword(formData: FormData): Promise<void> {
  const id = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;
  if (!id || !newPassword || newPassword.length < 6) return;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  } catch (e) {
    console.error("changePassword error:", e);
  }
  revalidatePath("/admin/users");
}

export async function updateUserRole(formData: FormData): Promise<void> {
  const id = formData.get("userId") as string;
  const role = formData.get("role") as string;
  if (!id || !role) return;
  try {
    await db.update(users).set({ role }).where(eq(users.id, id));
  } catch (e) {
    console.error("updateUserRole error:", e);
  }
  revalidatePath("/admin/users");
}
