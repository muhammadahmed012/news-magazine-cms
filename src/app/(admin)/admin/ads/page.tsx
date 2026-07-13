// src/app/(admin)/admin/ads/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Link as LinkIcon, BarChart3, Save } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  placement: string;
  type: string;
  code?: string | null;
  imageUrl?: string | null;
  targetUrl?: string | null;
  status: string;
  impressions: number;
  clicks: number;
  desktopOnly: boolean;
  mobileOnly: boolean;
  targetSection?: string | null;
}

const PLACEMENTS = [
  { value: "HEADER", label: "Header Banner", description: "Shown below the navigation on all pages" },
  { value: "SIDEBAR", label: "Sidebar", description: "Shown in article sidebar" },
  { value: "FOOTER", label: "Footer Banner", description: "Shown above the footer on all pages" },
  { value: "HOMEPAGE", label: "Homepage Between Sections", description: "Shown between homepage sections" },
  { value: "MOBILE", label: "Mobile Only", description: "Only shown on mobile devices" },
  { value: "ABOVE_HEADING", label: "Above Article Heading", description: "Shown above the article title on post pages" },
  { value: "BELOW_HEADING", label: "Below Article Heading", description: "Shown below the article title and meta info" },
  { value: "AFTER_PARA_1", label: "After 1st Paragraph", description: "Shown after the first paragraph of the article" },
  { value: "AFTER_PARA_2", label: "After 2nd Paragraph", description: "Shown after the second paragraph of the article" },
  { value: "AFTER_PARA_3", label: "After 3rd Paragraph", description: "Shown after the third paragraph of the article" },
  { value: "START_OF_ARTICLE", label: "Start of Article", description: "Shown at the beginning of the article content" },
  { value: "END_OF_ARTICLE", label: "End of Article", description: "Shown at the end of the article content" },
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("HEADER");
  const [type, setType] = useState("IMAGE");
  const [code, setCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [desktopOnly, setDesktopOnly] = useState(false);
  const [mobileOnly, setMobileOnly] = useState(false);
  const [targetSection, setTargetSection] = useState("");

  useEffect(() => {
    fetchAds();
    fetchSections();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/admin/ads", { credentials: "include" });
      const data = await res.json();
      setAds(data.ads || []);
    } catch (e) {
      console.error("Failed to fetch ads:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/admin/homepage-layout");
      const data = await res.json();
      setSections(data.layout || []);
    } catch (e) {
      console.error("Failed to fetch sections:", e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          placement,
          type,
          code,
          imageUrl,
          targetUrl,
          status,
          desktopOnly,
          mobileOnly,
          targetSection: placement === "HOMEPAGE" ? targetSection : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setTitle("");
        setCode("");
        setImageUrl("");
        setTargetUrl("");
        setTargetSection("");
        fetchAds();
      }
    } catch (e) {
      console.error("Failed to create ad:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _action: "delete", id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Delete failed:", err.error || res.statusText);
      }
      fetchAds();
    } catch (e) {
      console.error("Failed to delete ad:", e);
    }
  };

  const handleToggleStatus = async (ad: Ad) => {
    const newStatus = ad.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...ad, status: newStatus }),
      });
      fetchAds();
    } catch (e) {
      console.error("Failed to toggle ad status:", e);
    }
  };

  const getSectionLabel = (secId: string) => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return secId;
    return `${sec.type} (${sec.settings?.title || "No Title"})`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 select-none">
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Advertisement Manager
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Create ads and choose where they appear on your site.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Ads List */}
        <div className="lg:col-span-7 bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Active Campaigns ({ads.length})
            </h3>
          </div>

          <div className="divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text-primary">{ad.title}</span>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-secondary text-brand-primary border border-brand-primary rounded-sm">
                      {PLACEMENTS.find((p) => p.value === ad.placement)?.label || ad.placement}
                    </span>
                    {ad.placement === "HOMEPAGE" && ad.targetSection && (
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm">
                        After: {getSectionLabel(ad.targetSection)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ad)}
                      className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm border cursor-pointer transition-colors ${
                        ad.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {ad.status}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {ad.impressions} views</span>
                    <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {ad.clicks} clicks</span>
                    <span>Type: {ad.type}</span>
                    {ad.desktopOnly && <span className="text-blue-500">Desktop</span>}
                    {ad.mobileOnly && <span className="text-orange-500">Mobile</span>}
                  </div>

                  {ad.imageUrl && (
                    <img src={ad.imageUrl} alt={ad.title} className="max-h-16 w-auto rounded border border-border-subtle object-contain mt-1" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {ads.length === 0 && (
              <p className="text-center py-12 text-xs text-gray-400 italic font-semibold">No advertisements created yet.</p>
            )}
          </div>
        </div>

        {/* Right: Create Form */}
        <div className="lg:col-span-5 bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-4">
            Create New Ad
          </h3>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Summer Promo Banner"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Placement</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {placement === "HOMEPAGE" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Insert After Homepage Section</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                >
                  <option value="">-- Select Section --</option>
                  {sections.map((sec, idx) => (
                    <option key={sec.id} value={sec.id}>
                      Section {idx + 1}: {sec.type} ({sec.settings?.title || "Untitled"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Ad Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
              >
                <option value="IMAGE">Image Banner</option>
                <option value="HTML">Custom HTML / Script</option>
              </select>
            </div>

            {type === "IMAGE" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Target URL (click destination)</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/product"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>

            {type === "HTML" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">HTML / Script Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={4}
                  placeholder="<div>Your ad HTML or ad script here...</div>"
                  className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-y font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2 justify-center">
                <label className="flex items-center gap-2 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider cursor-pointer">
                  <input
                    type="checkbox"
                    checked={desktopOnly}
                    onChange={(e) => setDesktopOnly(e.target.checked)}
                    className="w-3.5 h-3.5 border-border-subtle text-brand-primary rounded"
                  />
                  <span>Desktop Only</span>
                </label>
                <label className="flex items-center gap-2 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mobileOnly}
                    onChange={(e) => setMobileOnly(e.target.checked)}
                    className="w-3.5 h-3.5 border-border-subtle text-brand-primary rounded"
                  />
                  <span>Mobile Only</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors mt-2 disabled:opacity-60 ${
                saved ? "bg-green-500" : ""
              }`}
            >
              <Plus className="w-4 h-4" /> {saving ? "Creating..." : saved ? "Created!" : "Create Ad"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
