// src/app/(admin)/admin/menus/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Navigation, Globe, CheckCircle } from "lucide-react";
import MenuBuilder from "./MenuBuilder";

interface MenuItem {
  id: string;
  label: string;
  link: string;
  target?: "_self" | "_blank";
  children?: MenuItem[];
}

export default function AdminMenusPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sticky, setSticky] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [logoPosition, setLogoPosition] = useState("left");
  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/header-config").then((r) => r.json()),
      fetch("/api/admin/pages").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/posts").then((r) => r.json()),
    ])
      .then(([headerData, pagesData, catsData, postsData]) => {
        setMenuItems(headerData?.menuItems || []);
        setSticky(headerData?.sticky ?? true);
        setTransparent(headerData?.transparent ?? false);
        setLogoPosition(headerData?.logoPosition || "left");
        setPages(pagesData?.pages || []);
        setCategories(catsData?.categories || []);
        setPosts(postsData?.posts || []);
      })
      .catch((e) => console.error("Failed to load menu data:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/header-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItems,
          sticky,
          transparent,
          logoPosition,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl select-none">
      <div className="pb-6 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            Header & Menu Builder
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Build your site navigation using a simple visual interface.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Header Behavior Settings */}
        <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <Globe className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Header Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-600 p-3 border border-border-subtle rounded-md hover:border-brand-primary transition-colors">
              <input
                type="checkbox"
                checked={sticky}
                onChange={(e) => setSticky(e.target.checked)}
                className="w-4 h-4 text-brand-primary border-border-subtle rounded"
              />
              Sticky Header (Pin on Scroll)
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-600 p-3 border border-border-subtle rounded-md hover:border-brand-primary transition-colors">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 text-brand-primary border-border-subtle rounded"
              />
              Transparent Header (Hero Mode)
            </label>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Logo Position</label>
              <select
                value={logoPosition}
                onChange={(e) => setLogoPosition(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
              >
                <option value="left">Left (Default)</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>
        </div>

        {/* Menu Builder */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-black text-text-primary">Main Navigation</h2>
          </div>
          <MenuBuilder
            initialMenu={menuItems}
            availablePages={pages}
            availableCategories={categories}
            availablePosts={posts}
            onChange={setMenuItems}
          />
        </div>

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
              saved
                ? "bg-green-500 text-white"
                : "bg-brand-primary hover:bg-brand-hover text-white"
            } disabled:opacity-60`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Menus"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
