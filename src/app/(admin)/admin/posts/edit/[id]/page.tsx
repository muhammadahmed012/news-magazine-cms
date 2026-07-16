// src/app/(admin)/admin/posts/edit/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import lazy from "next/dynamic";
import { auth } from "@/lib/auth";

const PostEditor = lazy(() => import("@/components/admin/PostEditor"));

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const postId = resolvedParams.id;

  // Fetch post details including revisions
  const [post, categories, authors] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      include: {
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    }),
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

  if (!post) {
    notFound();
  }

  return <PostEditor post={post} categories={categories} authors={authors} />;
}
