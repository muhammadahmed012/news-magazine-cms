// src/app/(admin)/admin/layout.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Navigation,
  Grid,
  Palette,
  Megaphone,
  Settings,
  Globe,
  LogOut,
  Users,
  MessageSquare,
  ArrowLeft,
  PanelRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Posts", href: "/admin/posts", icon: FileText },
    { label: "Pages", href: "/admin/pages", icon: FileText },
    { label: "Categories & Tags", href: "/admin/categories", icon: FolderOpen },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Comments", href: "/admin/comments", icon: MessageSquare },
    { label: "Media Library", href: "/admin/media", icon: Image },
    { label: "Menus Builder", href: "/admin/menus", icon: Navigation },
    { label: "Header Builder", href: "/admin/header", icon: Globe },
    { label: "Footer Builder", href: "/admin/footer", icon: LayoutDashboard },
    { label: "Homepage Builder", href: "/admin/homepage", icon: Grid },
    { label: "Sidebar Builder", href: "/admin/sidebar", icon: PanelRight },
    { label: "Theme & Branding", href: "/admin/theme", icon: Palette },
    { label: "Ad Manager", href: "/admin/ads", icon: Megaphone },
    { label: "General Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar (Fixed desktop, collapsible mobile drawer can be simulated or basic static layout) */}
      <aside className="w-64 bg-white border-r border-border-subtle flex flex-col shrink-0 select-none">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-white">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif font-black text-xl tracking-tight text-brand-primary">
              Chronicle
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-secondary text-brand-primary border border-brand-primary rounded-sm">
              CMS
            </span>
          </Link>
        </div>

        {/* User Info Bar */}
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-light/40 flex items-center gap-3">
          {session.user.image ? (
            <img src={session.user.image} alt={session.user.name || ""} className="w-9 h-9 rounded-full object-cover border border-border-subtle" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
              {session.user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="truncate flex flex-col">
            <span className="text-xs font-bold text-text-primary truncate">{session.user.name}</span>
            <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wider truncate">{session.user.role}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold text-gray-500 hover:bg-bg-light hover:text-brand-primary transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-border-subtle space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold text-gray-600 hover:bg-bg-light transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Visit Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-border-subtle flex items-center justify-between px-8 shrink-0 select-none">
          <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
            <span>Administration Panel</span>
            <span>/</span>
            <span className="text-text-primary">Overview</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-400 bg-bg-light px-2.5 py-1 rounded-full border border-border-subtle">
              v1.0.0
            </span>
          </div>
        </header>

        {/* Sub page layout slot */}
        <main className="flex-grow p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
