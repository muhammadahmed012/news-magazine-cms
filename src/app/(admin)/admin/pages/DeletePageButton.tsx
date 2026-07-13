"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePage } from "@/actions/admin-pages";
import { useRouter } from "next/navigation";

export default function DeletePageButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) return;
    setIsDeleting(true);
    await deletePage(id);
    setIsDeleting(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
      title="Delete Page"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
