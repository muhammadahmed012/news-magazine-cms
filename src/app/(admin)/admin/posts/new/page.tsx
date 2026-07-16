// src/app/(admin)/admin/posts/new/page.tsx
import { prisma } from "@/lib/db";
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

  // Fetch options for editor dropdowns
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR"] }
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  return <PostEditor categories={categories} authors={authors} />;
}
