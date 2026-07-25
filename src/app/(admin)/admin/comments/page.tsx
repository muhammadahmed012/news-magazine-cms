// src/app/(admin)/admin/comments/page.tsx
import { db } from "@/lib/db";
import { comments, posts, categories, users } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { MessageSquare, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const commentsList = await db
    .select({
      id: comments.id,
      content: comments.content,
      status: comments.status,
      postId: comments.postId,
      authorId: comments.authorId,
      guestName: comments.guestName,
      guestEmail: comments.guestEmail,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      postTitle: posts.title,
      postSlug: posts.slug,
      categorySlug: categories.slug,
      authorName: users.name,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(comments.authorId, users.id))
    .orderBy(desc(comments.createdAt));

  const handleApprove = async (formData: FormData) => {
    "use server";
    const id = formData.get("commentId") as string;
    if (!id) return;
    await db.update(comments).set({ status: "APPROVED" }).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  };

  const handleSpam = async (formData: FormData) => {
    "use server";
    const id = formData.get("commentId") as string;
    if (!id) return;
    await db.update(comments).set({ status: "SPAM" }).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  };

  const handleDelete = async (formData: FormData) => {
    "use server";
    const id = formData.get("commentId") as string;
    if (!id) return;
    await db.delete(comments).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  };

  const approved = commentsList.filter((c) => c.status === "APPROVED");
  const pending = commentsList.filter((c) => c.status === "PENDING");
  const spam = commentsList.filter((c) => c.status === "SPAM");

  return (
    <div className="flex flex-col gap-8 select-none">
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Comments Moderation
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Approve, reject, or delete reader discussions across all articles.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Approved", count: approved.length, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Pending", count: pending.length, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          { label: "Spam", count: spam.length, color: "text-red-600", bg: "bg-red-50 border-red-200" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} border rounded-md p-4 flex flex-col gap-1`}>
            <span className={`text-2xl font-serif font-black ${item.color}`}>{item.count}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light/40 border-b border-border-subtle text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Commenter</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs font-semibold text-text-primary">
              {commentsList.map((comment) => (
                <tr key={comment.id} className="hover:bg-bg-light/20 transition-colors">
                  <td className="px-6 py-4 font-bold">
                    {comment.authorName || comment.guestName || "Anonymous"}
                    {!comment.authorId && (
                      <span className="block text-[9px] text-gray-400 font-semibold">Guest</span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate text-gray-600">{comment.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/${comment.categorySlug}/${comment.postSlug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-brand-primary hover:underline max-w-[150px] truncate"
                    >
                      {comment.postTitle}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                      comment.status === "APPROVED"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : comment.status === "SPAM"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {comment.status !== "APPROVED" && (
                        <form action={handleApprove}>
                          <input type="hidden" name="commentId" value={comment.id} />
                          <button type="submit" title="Approve" className="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                      {comment.status !== "SPAM" && (
                        <form action={handleSpam}>
                          <input type="hidden" name="commentId" value={comment.id} />
                          <button type="submit" title="Mark as spam" className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                      <form action={handleDelete}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button type="submit" title="Delete" className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {commentsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs text-gray-400 italic">No comments to moderate.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
