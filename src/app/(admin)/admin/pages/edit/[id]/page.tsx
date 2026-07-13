// src/app/(admin)/admin/pages/edit/[id]/page.tsx
import AdminPageForm from "../../AdminPageForm";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  const page = await prisma.page.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!page) {
    notFound();
  }

  return <AdminPageForm initialData={page} session={session} />;
}
