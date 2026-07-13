// src/app/(admin)/admin/pages/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import DeletePageButton from "./DeletePageButton";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Pages</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Manage standalone pages (e.g., About Us, Contact, Privacy Policy).
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="bg-brand-primary hover:bg-brand-hover text-white px-5 py-2.5 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Page
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary whitespace-nowrap">
            <thead className="bg-bg-light border-b border-border-subtle text-xs uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">{page.title}</span>
                        <span className="text-xs text-gray-400 font-medium">/{page.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-xs text-gray-600">
                    {page.author.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        page.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pages/edit/${page.id}`}
                        className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
                        title="Edit Page"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeletePageButton id={page.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium text-sm">
                    No pages found. Create your first page to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
