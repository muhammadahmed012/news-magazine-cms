// src/app/(admin)/admin/footer/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface FooterColumn {
  title: string;
  content?: string;
  links?: { label: string; url: string }[];
}

interface FooterColors {
  backgroundColor?: string;
  textColor?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  borderColor?: string;
  bottomBarBg?: string;
  socialIconBg?: string;
  socialIconHoverBg?: string;
  socialIconHoverColor?: string;
  twitterHover?: string;
  facebookHover?: string;
  linkedinHover?: string;
  instagramHover?: string;
  youtubeHover?: string;
  githubHover?: string;
}

interface FooterConfig {
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
  copyright?: string;
  columns: FooterColumn[];
  colors?: FooterColors;
  newsletter?: {
    enabled?: boolean;
    title?: string;
    description?: string;
  };
}

export default function AdminFooterPage() {
  const [config, setConfig] = useState<FooterConfig>({
    socialLinks: { twitter: "", facebook: "", linkedin: "", instagram: "", youtube: "", github: "" },
    copyright: "",
    columns: [],
    colors: {},
    newsletter: { enabled: true, title: "", description: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/footer-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          socialLinks: data.socialLinks || { twitter: "", facebook: "", linkedin: "", instagram: "", youtube: "", github: "" },
          copyright: data.copyright || "",
          columns: data.columns || [],
          colors: data.colors || {},
          newsletter: data.newsletter || { enabled: true, title: "", description: "" },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
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

  const updateSocial = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const addColumn = () => {
    setConfig((prev) => ({
      ...prev,
      columns: [...prev.columns, { title: "", content: "", links: [] }],
    }));
  };

  const removeColumn = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== idx),
    }));
  };

  const updateColumn = (idx: number, patch: Partial<FooterColumn>) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === idx ? { ...col, ...patch } : col)),
    }));
  };

  const addColumnLink = (colIdx: number) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === colIdx ? { ...col, links: [...(col.links || []), { label: "", url: "" }] } : col
      ),
    }));
  };

  const removeColumnLink = (colIdx: number, linkIdx: number) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === colIdx ? { ...col, links: (col.links || []).filter((_, j) => j !== linkIdx) } : col
      ),
    }));
  };

  const updateColumnLink = (colIdx: number, linkIdx: number, patch: { label?: string; url?: string }) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === colIdx
          ? { ...col, links: (col.links || []).map((link, j) => (j === linkIdx ? { ...link, ...patch } : link)) }
          : col
      ),
    }));
  };

  const moveColumn = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= config.columns.length) return;
    setConfig((prev) => {
      const cols = [...prev.columns];
      [cols[idx], cols[newIdx]] = [cols[newIdx], cols[idx]];
      return { ...prev, columns: cols };
    });
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
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Footer Settings
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Configure footer columns, social links, and copyright text.
        </p>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Social Profiles</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/..." },
            { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
            { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
            { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
            { key: "github", label: "GitHub", placeholder: "https://github.com/..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                {label} URL
              </label>
              <input
                type="url"
                value={(config.socialLinks as any)[key] || ""}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Colors */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Footer Colors</h3>
          <p className="text-[10px] text-gray-400 mt-1">Customize the footer appearance to match your brand.</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { key: "backgroundColor", label: "Background", default: "#F5F5F5" },
            { key: "textColor", label: "Text Color", default: "#1A1A1A" },
            { key: "headingColor", label: "Headings", default: "#5F4A8B" },
            { key: "linkColor", label: "Links", default: "#6B7280" },
            { key: "linkHoverColor", label: "Link Hover", default: "#5F4A8B" },
            { key: "borderColor", label: "Borders", default: "#EAEAEA" },
            { key: "bottomBarBg", label: "Bottom Bar BG", default: "#FFFFFF" },
            { key: "socialIconBg", label: "Social Icon BG", default: "#F5F5F5" },
            { key: "socialIconHoverBg", label: "Social Hover BG", default: "#1A1A1A" },
            { key: "socialIconHoverColor", label: "Social Hover Color", default: "#FFFFFF" },
          ].map(({ key, label, default: defaultVal }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(config.colors as any)?.[key] || defaultVal}
                  onChange={(e) => setConfig((prev) => ({
                    ...prev,
                    colors: { ...prev.colors, [key]: e.target.value },
                  }))}
                  className="w-8 h-8 rounded border border-border-subtle cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={(config.colors as any)?.[key] || ""}
                  onChange={(e) => setConfig((prev) => ({
                    ...prev,
                    colors: { ...prev.colors, [key]: e.target.value },
                  }))}
                  placeholder={defaultVal}
                  className="flex-1 text-xs font-mono font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Newsletter Section</h3>
            <p className="text-[10px] text-gray-400 mt-1">Toggle the newsletter subscribe form in the footer.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.newsletter?.enabled ?? true}
              onChange={(e) => setConfig((prev) => ({
                ...prev,
                newsletter: { ...prev.newsletter, enabled: e.target.checked },
              }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
          </label>
        </div>
        {(config.newsletter?.enabled ?? true) && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Newsletter Title</label>
              <input
                type="text"
                value={config.newsletter?.title || ""}
                onChange={(e) => setConfig((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, title: e.target.value },
                }))}
                placeholder="e.g. Stay Updated"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <input
                type="text"
                value={config.newsletter?.description || ""}
                onChange={(e) => setConfig((prev) => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, description: e.target.value },
                }))}
                placeholder="Subscribe to our newsletter for weekly briefings."
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Copyright */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Copyright Text</h3>
        </div>
        <div className="p-6">
          <input
            type="text"
            value={config.copyright}
            onChange={(e) => setConfig((prev) => ({ ...prev, copyright: e.target.value }))}
            placeholder="© 2026 Chronicle. All rights reserved."
            className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
          />
        </div>
      </div>

      {/* Footer Columns - Visual Editor */}
      <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Footer Columns</h3>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-brand-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Column
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {config.columns.length === 0 && (
            <p className="text-center py-8 text-xs text-gray-400 italic">No columns yet. Add one above.</p>
          )}
          {config.columns.map((column, colIdx) => (
            <div key={colIdx} className="border border-border-subtle rounded-md overflow-hidden">
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5 opacity-50 hover:opacity-100">
                    <button type="button" onClick={() => moveColumn(colIdx, -1)} disabled={colIdx === 0} className="disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => moveColumn(colIdx, 1)} disabled={colIdx === config.columns.length - 1} className="disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">Column {colIdx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeColumn(colIdx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Content */}
              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Column Title</label>
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => updateColumn(colIdx, { title: e.target.value })}
                    placeholder="e.g. About, Quick Links..."
                    className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Text Content (optional)</label>
                  <textarea
                    value={column.content || ""}
                    onChange={(e) => updateColumn(colIdx, { content: e.target.value })}
                    placeholder="Static text content for this column..."
                    rows={3}
                    className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-y"
                  />
                </div>

                {/* Links */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Links</label>
                    <button
                      type="button"
                      onClick={() => addColumnLink(colIdx)}
                      className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>
                  {(column.links || []).map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateColumnLink(colIdx, linkIdx, { label: e.target.value })}
                        placeholder="Label"
                        className="flex-1 text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateColumnLink(colIdx, linkIdx, { url: e.target.value })}
                        placeholder="URL"
                        className="flex-1 text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeColumnLink(colIdx, linkIdx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
          {saving ? "Saving..." : saved ? "Saved!" : "Save Footer Settings"}
        </button>
      </div>
    </div>
  );
}
