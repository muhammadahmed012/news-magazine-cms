// src/app/(admin)/admin/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  FileText,
  Folder,
  Users,
  MessageSquare,
  Eye,
  Plus,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch counts from database in parallel
  const [postCount, categoryCount, subscriberCount, commentCount, recentPosts, stats] = await Promise.all([
    prisma.post.count(),
    prisma.category.count(),
    prisma.newsletterSubscriber.count(),
    prisma.comment.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } }
      }
    }),
    prisma.post.aggregate({
      _sum: {
        viewCount: true
      }
    })
  ]);

  const totalViews = stats._sum.viewCount || 0;

  const statsCards = [
    { label: "Total Articles", value: postCount, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Categories", value: categoryCount, icon: Folder, color: "text-green-500", bg: "bg-green-50" },
    { label: "Subscribers", value: subscriberCount, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Comments", value: commentCount, icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" }
  ];

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Welcome banner */}
      <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Real-time analytics and publication metrics.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-md text-xs font-bold tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.label}</span>
                <span className="text-2xl font-serif font-black text-text-primary">{card.value}</span>
              </div>
              <div className={`p-3 rounded-full ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics chart panel & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Card */}
        <div className="lg:col-span-2 bg-white border border-border-subtle rounded-md shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <h3 className="font-serif font-black text-base text-text-primary flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-brand-primary" /> Traffic Performance
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Last 30 Days</span>
          </div>

          <div className="flex items-center gap-4 bg-bg-light/40 border border-border-subtle p-4 rounded-md">
            <Eye className="w-8 h-8 text-brand-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Content Views</span>
              <span className="text-xl font-serif font-black text-text-primary">{totalViews}</span>
            </div>
          </div>
          
          <div className="h-48 bg-bg-light/20 rounded border border-dashed border-border-subtle flex items-center justify-center">
            <span className="text-xs text-gray-400 font-semibold italic">Visitor behavior analytics are live-tracked. Integrate GA4 / Clarity below.</span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-border-subtle rounded-md shadow-sm p-6 flex flex-col gap-6">
          <h3 className="font-serif font-black text-base text-text-primary border-b border-border-subtle pb-4">
            Quick Setup Checklist
          </h3>
          
          <ul className="flex flex-col gap-4">
            <li>
              <Link href="/admin/theme" className="group flex items-center justify-between p-3 bg-bg-light/60 hover:bg-brand-primary/5 border border-border-subtle hover:border-brand-primary rounded-md transition-all">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors">Rebrand Colors & Style</span>
                  <span className="text-[10px] text-gray-400">Modify branding CSS variables</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
              </Link>
            </li>
            <li>
              <Link href="/admin/homepage" className="group flex items-center justify-between p-3 bg-bg-light/60 hover:bg-brand-primary/5 border border-border-subtle hover:border-brand-primary rounded-md transition-all">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors">Re-order Home Layout</span>
                  <span className="text-[10px] text-gray-400">Configure page grids</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
              </Link>
            </li>
            <li>
              <Link href="/admin/ads" className="group flex items-center justify-between p-3 bg-bg-light/60 hover:bg-brand-primary/5 border border-border-subtle hover:border-brand-primary rounded-md transition-all">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors">Set Ad Placements</span>
                  <span className="text-[10px] text-gray-400">Manage tags and code scripts</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Posts list */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm p-6">
        <h3 className="font-serif font-black text-base text-text-primary mb-6 border-b border-border-subtle pb-4">
          Recently Written Articles
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Author</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Views</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentPosts.map((post) => (
                <tr key={post.id} className="text-xs font-semibold text-text-primary hover:bg-bg-light/20 transition-colors">
                  <td className="py-4 max-w-xs truncate pr-4 font-bold">{post.title}</td>
                  <td className="py-4 text-gray-500">{post.category.name}</td>
                  <td className="py-4 text-gray-500">{post.author.name}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      post.status === "PUBLISHED" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">{post.viewCount}</td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="text-brand-primary hover:underline font-bold"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {recentPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-xs text-gray-400 italic">No posts created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
