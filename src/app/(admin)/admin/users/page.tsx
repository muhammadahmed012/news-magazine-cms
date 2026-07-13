// src/app/(admin)/admin/users/page.tsx
import { prisma } from "@/lib/db";
import { createUser, deleteUser, changePassword, updateUserRole } from "@/actions/admin-users";
import { Users, UserPlus, Trash2, KeyRound, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-700 border-red-200",
  EDITOR: "bg-blue-50 text-blue-700 border-blue-200",
  AUTHOR: "bg-green-50 text-green-700 border-green-200",
  CONTRIBUTOR: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SUBSCRIBER: "bg-gray-50 text-gray-600 border-gray-200",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 select-none">
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-primary" /> User Management
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Add editors, authors, and contributors. Change passwords and manage roles.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* ── User Table ── */}
        <div className="xl:col-span-8 bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
              All Users ({users.length})
            </h3>
          </div>

          <div className="divide-y divide-border-subtle">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-bg-light/30 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0">
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-black text-text-primary">{user.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${ROLE_COLORS[user.role] || ROLE_COLORS.SUBSCRIBER}`}>
                        {user.role}
                      </span>
                      {user.title && (
                        <span className="text-[10px] text-gray-400 font-semibold">{user.title}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">{user.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">
                      {user._count.posts} article{user._count.posts !== 1 ? "s" : ""} · Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {/* Change Role */}
                    <form action={updateUserRole} className="flex items-center gap-1.5">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="text-[10px] font-bold px-2 py-1.5 border border-border-subtle bg-white rounded-md outline-none"
                      >
                        {["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="p-1.5 bg-brand-primary text-white rounded hover:bg-brand-hover transition-colors"
                        title="Save Role"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    </form>

                    {/* Delete */}
                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 hover:text-red-700 px-2 py-1.5 hover:bg-red-50 rounded transition-colors w-full"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete User
                      </button>
                    </form>
                  </div>
                </div>

                {/* Change Password section */}
                <details className="mt-3">
                  <summary className="text-[10px] font-bold text-gray-400 hover:text-brand-primary cursor-pointer flex items-center gap-1.5 transition-colors">
                    <KeyRound className="w-3.5 h-3.5" /> Change Password
                  </summary>
                  <form action={changePassword} className="mt-3 flex items-center gap-2 pl-5">
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={6}
                      placeholder="New password (min 6 chars)"
                      className="flex-1 text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none max-w-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors whitespace-nowrap"
                    >
                      Update Password
                    </button>
                  </form>
                </details>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center py-12 text-xs text-gray-400 italic">No users found.</p>
            )}
          </div>
        </div>

        {/* ── Add New User Form ── */}
        <div className="xl:col-span-4 bg-white border border-border-subtle p-6 rounded-md shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-4 mb-5 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-brand-primary" /> Add New User
          </h3>

          <form action={createUser} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Jane Smith"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="jane@example.com"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password *</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Role</label>
                <select
                  name="role"
                  defaultValue="CONTRIBUTOR"
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EDITOR">Editor</option>
                  <option value="AUTHOR">Author</option>
                  <option value="CONTRIBUTOR">Contributor</option>
                  <option value="SUBSCRIBER">Subscriber</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Senior Reporter"
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Bio</label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Short biography..."
                className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="mt-1 bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Create User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
