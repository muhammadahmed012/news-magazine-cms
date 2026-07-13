// src/app/(admin)/admin/homepage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, PlusCircle, Trash2, ChevronUp, ChevronDown, Grid, ToggleLeft, ToggleRight } from "lucide-react";
import { CARD_STYLES } from "@/components/public/CategoryCardStyles";

interface LayoutSection {
  id: string;
  type: string;
  enabled: boolean;
  settings: {
    title?: string;
    subtitle?: string;
    postsCount?: number;
    categorySlug?: string;
    layout?: "grid" | "row";
    cardStyle?: string;
    sidebarType?: "trending" | "latest" | "category";
  };
}

const SECTION_TYPES = [
  { type: "HeroSlider", label: "Hero Slider", description: "Full-width featured article slider" },
  { type: "FeaturedArticles", label: "Editor's Picks", description: "Curated + trending split layout" },
  { type: "LatestNews", label: "Latest News", description: "Grid or list of newest articles" },
  { type: "CategoryBlock", label: "Category Block", description: "Articles from a single category" },
  { type: "CollectionBlock", label: "Collection Block", description: "Main content + trending sidebar" },
  { type: "NewsletterSignup", label: "Newsletter Signup", description: "Email subscription banner" },
];

function generateId() {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdminHomepageBuilderPage() {
  const [layout, setLayout] = useState<LayoutSection[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addType, setAddType] = useState("LatestNews");

  useEffect(() => {
    // Fetch current layout from API
    fetch("/api/admin/homepage-layout")
      .then((r) => r.json())
      .then((data) => {
        setLayout(data.layout || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/homepage-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSection: LayoutSection = {
      id: generateId(),
      type: addType,
      enabled: true,
      settings: { postsCount: 4 },
    };
    setLayout((prev) => [...prev, newSection]);
  };

  const removeSection = (id: string) => {
    if (!confirm("Remove this section?")) return;
    setLayout((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setLayout((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const updateSection = (id: string, patch: Partial<LayoutSection>) => {
    setLayout((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const updateSettings = (id: string, key: string, value: any) => {
    setLayout((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, settings: { ...s.settings, [key]: value } } : s
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl select-none">
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight flex items-center gap-2">
          <Grid className="w-6 h-6 text-brand-primary" /> Homepage Layout Builder
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Add, remove, reorder and configure sections shown on the public homepage.
        </p>
      </div>

      {/* Add New Section Bar */}
      <div className="bg-white border border-border-subtle p-5 rounded-md shadow-sm flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Add Section:</span>
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
          className="text-xs font-semibold px-3 py-2.5 border border-border-subtle bg-white rounded-md text-gray-700 outline-none flex-1 min-w-[200px]"
        >
          {SECTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label} — {t.description}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addSection}
          className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Sections List */}
      <div className="flex flex-col gap-4">
        {layout.length === 0 && (
          <div className="bg-white border border-dashed border-border-subtle rounded-md py-16 text-center">
            <Grid className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-xs text-gray-400 font-semibold">No sections yet. Add one above to get started.</p>
          </div>
        )}

        {layout.map((section, idx) => (
          <div key={section.id} className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-bg-light/40 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-black flex items-center justify-center border border-brand-primary/20">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-black text-text-primary">
                    {SECTION_TYPES.find((t) => t.type === section.type)?.label || section.type}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {SECTION_TYPES.find((t) => t.type === section.type)?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle enable */}
                <button
                  type="button"
                  onClick={() => updateSection(section.id, { enabled: !section.enabled })}
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded border transition-colors ${
                    section.enabled
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {section.enabled ? (
                    <><ToggleRight className="w-3.5 h-3.5" /> Active</>
                  ) : (
                    <><ToggleLeft className="w-3.5 h-3.5" /> Disabled</>
                  )}
                </button>

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveSection(section.id, "up")}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-brand-primary disabled:opacity-30 hover:bg-bg-light rounded transition-all"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveSection(section.id, "down")}
                  disabled={idx === layout.length - 1}
                  className="p-1.5 text-gray-400 hover:text-brand-primary disabled:opacity-30 hover:bg-bg-light rounded transition-all"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Settings */}
            {section.enabled && (
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Title (not for NewsletterSignup alone but always useful) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                    {section.type === "NewsletterSignup" ? "Headline" : "Section Title"}
                  </label>
                  <input
                    type="text"
                    value={section.settings.title || ""}
                    onChange={(e) => updateSettings(section.id, "title", e.target.value)}
                    placeholder="Override default title"
                    className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Subtitle — for Newsletter */}
                {section.type === "NewsletterSignup" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Subtitle Copy</label>
                    <input
                      type="text"
                      value={section.settings.subtitle || ""}
                      onChange={(e) => updateSettings(section.id, "subtitle", e.target.value)}
                      placeholder="Supporting text..."
                      className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md outline-none focus:border-brand-primary"
                    />
                  </div>
                )}

                {/* Posts Count */}
                {["HeroSlider", "FeaturedArticles", "LatestNews", "CategoryBlock", "CollectionBlock"].includes(section.type) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Articles to Show</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={section.settings.postsCount || 4}
                      onChange={(e) => updateSettings(section.id, "postsCount", Number(e.target.value))}
                      className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md outline-none focus:border-brand-primary"
                    />
                  </div>
                )}

                {/* Category Selector — for CategoryBlock and CollectionBlock */}
                {(section.type === "CategoryBlock" || section.type === "CollectionBlock") && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                      {section.type === "CollectionBlock" ? "Main Content Category" : "Category Source"}
                    </label>
                    <select
                      value={section.settings.categorySlug || ""}
                      onChange={(e) => updateSettings(section.id, "categorySlug", e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sidebar Type — for CollectionBlock */}
                {section.type === "CollectionBlock" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Sidebar Content</label>
                    <select
                      value={section.settings.sidebarType || "trending"}
                      onChange={(e) => updateSettings(section.id, "sidebarType", e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                    >
                      <option value="trending">Trending (by views)</option>
                      <option value="latest">Latest (by date)</option>
                      <option value="category">Same Category</option>
                    </select>
                  </div>
                )}

                {/* Card Style — for CategoryBlock */}
                {section.type === "CategoryBlock" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Card Design Style</label>
                    <select
                      value={section.settings.cardStyle || "classic"}
                      onChange={(e) => updateSettings(section.id, "cardStyle", e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                    >
                      {CARD_STYLES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label} — {s.description}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
            saved
              ? "bg-green-500 text-white"
              : "bg-brand-primary hover:bg-brand-hover text-white"
          } disabled:opacity-60`}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Layout"}
        </button>
      </div>
    </div>
  );
}
