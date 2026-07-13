// src/app/(admin)/admin/header/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Palette, Type, Image, Share2, Loader2 } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";

interface HeaderColors {
  backgroundColor?: string;
  textColor?: string;
  navColor?: string;
  navHoverColor?: string;
  borderColor?: string;
  mobileMenuBg?: string;
  logoFilter?: string;
}

interface SocialLinks {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

interface HeaderConfig {
  colors?: HeaderColors;
  logoUrl?: string;
  logoHeight?: string;
  sticky?: boolean;
  transparent?: boolean;
  logoPosition?: string;
  socialLinks?: SocialLinks;
}

export default function AdminHeaderPage() {
  const [config, setConfig] = useState<HeaderConfig>({
    colors: {},
    logoUrl: "",
    logoHeight: "40",
    sticky: true,
    transparent: false,
    logoPosition: "left",
    socialLinks: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    fetch("/api/admin/header-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          colors: data.colors || {},
          logoUrl: data.logoUrl || "",
          logoHeight: data.logoHeight || "40",
          sticky: data.sticky ?? true,
          transparent: data.transparent ?? false,
          logoPosition: data.logoPosition || "left",
          socialLinks: data.socialLinks || {},
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/header-config", {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => {
            setConfig((prev) => ({ ...prev, logoUrl: url }));
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      <div className="flex flex-col gap-8 max-w-4xl select-none">
        <div className="pb-6 border-b border-border-subtle">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            Header Settings
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Customize the header appearance, logo, social links, and navigation behavior.
          </p>
        </div>

        {/* Logo Settings */}
        <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-2">
            <Image className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Logo</h3>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {/* Logo Preview + Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Logo</label>
              <div className="flex items-center gap-4">
                {config.logoUrl ? (
                  <div className="w-40 h-16 border border-border-subtle rounded-md flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                    <img
                      src={config.logoUrl}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-16 border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 shrink-0">
                    <span className="text-[10px] text-gray-400 font-semibold">No logo set</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="px-4 py-2 bg-brand-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-md hover:bg-brand-hover transition-colors flex items-center gap-1.5"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Browse Media Library
                  </button>
                  {config.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, logoUrl: "" }))}
                      className="px-4 py-1.5 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Or paste logo URL</label>
                <input
                  type="text"
                  value={config.logoUrl || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png (leave empty for text logo)"
                  className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Logo Height (px)</label>
              <input
                type="number"
                value={config.logoHeight || "40"}
                onChange={(e) => setConfig((prev) => ({ ...prev, logoHeight: e.target.value }))}
                min="20"
                max="80"
                className="w-32 text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-2">
            <Share2 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Social Links</h3>
            <p className="text-[10px] text-gray-400 ml-2">Displayed in the header next to the navigation.</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/username", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
              { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/page", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
              { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/page", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
              { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              { key: "github", label: "GitHub", placeholder: "https://github.com/username", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
            ].map(({ key, label, placeholder, icon }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-gray-500"><path d={icon}/></svg>
                  {label}
                </label>
                <input
                  type="url"
                  value={(config.socialLinks as any)?.[key] || ""}
                  onChange={(e) => setConfig((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                  }))}
                  placeholder={placeholder}
                  className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Header Colors */}
        <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Header Colors</h3>
            <p className="text-[10px] text-gray-400 ml-2">Customize the header appearance to match your brand.</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { key: "backgroundColor", label: "Background", default: "#FFFFFF" },
              { key: "textColor", label: "Text Color", default: "#1A1A1A" },
              { key: "navColor", label: "Nav Links", default: "#374151" },
              { key: "navHoverColor", label: "Nav Hover", default: "#5F4A8B" },
              { key: "borderColor", label: "Borders", default: "#EAEAEA" },
              { key: "mobileMenuBg", label: "Mobile Menu BG", default: "#FFFFFF" },
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

        {/* Behavior */}
        <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-2">
            <Type className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Behavior</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-600 p-3 border border-border-subtle rounded-md hover:border-brand-primary transition-colors">
              <input
                type="checkbox"
                checked={config.sticky ?? true}
                onChange={(e) => setConfig((prev) => ({ ...prev, sticky: e.target.checked }))}
                className="w-4 h-4 text-brand-primary border-border-subtle rounded"
              />
              Sticky Header
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-600 p-3 border border-border-subtle rounded-md hover:border-brand-primary transition-colors">
              <input
                type="checkbox"
                checked={config.transparent ?? false}
                onChange={(e) => setConfig((prev) => ({ ...prev, transparent: e.target.checked }))}
                className="w-4 h-4 text-brand-primary border-border-subtle rounded"
              />
              Transparent (Hero Mode)
            </label>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Logo Position</label>
              <select
                value={config.logoPosition || "left"}
                onChange={(e) => setConfig((prev) => ({ ...prev, logoPosition: e.target.value }))}
                className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
              </select>
            </div>
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
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Saved!
              </>
            ) : saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Header Settings
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
