// src/app/(admin)/admin/pages/edit/[id]/page.tsx
import AdminPageForm from "../../AdminPageForm";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, resolvedParams.id))
    .limit(1);

  if (!page) {
    notFound();
  }

  return <AdminPageForm initialData={page} session={session} />;
}
