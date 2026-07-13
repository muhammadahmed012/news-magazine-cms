// src/app/(admin)/admin/pages/new/page.tsx
import AdminPageForm from "../AdminPageForm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const session = await auth();
  return <AdminPageForm session={session} />;
}
