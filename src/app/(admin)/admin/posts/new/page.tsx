// src/app/(admin)/admin/posts/new/page.tsx
import { db } from "@/lib/db";
import { categories, users } from "@/lib/schema";
import { eq, asc, inArray } from "drizzle-orm";
import lazy from "next/dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const PostEditor = lazy(() => import("@/components/admin/PostEditor"));

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const [categoryList, authorList] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.order)),
    db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(inArray(users.role, ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR"]))
      .orderBy(asc(users.name)),
  ]);

  return <PostEditor categories={categoryList} authors={authorList} />;
}
