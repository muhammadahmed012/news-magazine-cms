// src/app/(admin)/admin/posts/edit/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { posts, categories, users, revisions } from "@/lib/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";
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

  const [postRow, categoryList, authorList] = await Promise.all([
    db.select().from(posts).where(eq(posts.id, postId)).limit(1).then((r) => r[0]),
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

  if (!postRow) {
    notFound();
  }

  const revisionList = await db
    .select()
    .from(revisions)
    .where(eq(revisions.postId, postId))
    .orderBy(desc(revisions.createdAt))
    .limit(10);

  const post = { ...postRow, revisions: revisionList };

  return <PostEditor post={post} categories={categoryList} authors={authorList} />;
}
