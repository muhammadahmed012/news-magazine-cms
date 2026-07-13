// src/app/(admin)/admin/posts/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Search, Calendar, User, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  // Fetch all posts ordered by creation date
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Header section */}
      <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            Manage Articles
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Create, update, schedule, and view performance metrics.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-md text-xs font-bold tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light/40 border-b border-border-subtle text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Publish Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs font-semibold text-text-primary">
              {posts.map((post) => {
                const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={post.id} className="hover:bg-bg-light/20 transition-colors">
                    <td className="px-6 py-4 max-w-xs truncate pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold">{post.title}</span>
                        {post.isFeatured && (
                          <span className="text-[8px] font-extrabold uppercase text-purple-600 bg-purple-50 border border-purple-200 px-1 py-0.5 rounded self-start mt-1">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{post.category.name}</td>
                    <td className="px-6 py-4 text-gray-500">{post.author.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        post.status === "PUBLISHED"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : post.status === "SCHEDULED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{post.viewCount}</td>
                    <td className="px-6 py-4 text-gray-500">{dateStr}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="text-brand-primary hover:underline font-bold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-gray-400 italic">No posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
