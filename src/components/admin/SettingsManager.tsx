"use client";

import { useState } from "react";
import { saveSetting } from "@/actions/admin-settings";
import { Settings, Globe, Bell, Save, Map, Shield, Check, Loader2 } from "lucide-react";

interface GeneralSettings {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  announcementText?: string;
  announcementLink?: string;
  announcementEnabled?: boolean;
  tickerEnabled?: boolean;
  tickerText?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
}

interface SeoSettings {
  metaTitleTemplate?: string;
  metaDescription?: string;
}

interface SitemapSettings {
  posts?: boolean;
  pages?: boolean;
  categories?: boolean;
}

interface IndexingSettings {
  discourageIndexing?: boolean;
}

interface HomepageSettings {
  showCategoryBar?: boolean;
}

interface SettingsManagerProps {
  general: GeneralSettings;
  seo: SeoSettings;
  sitemap: SitemapSettings;
  indexing: IndexingSettings;
  homepage?: HomepageSettings;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-5 py-3 rounded-lg shadow-xl text-sm font-bold transition-all animate-in slide-in-from-bottom-4 ${
      type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success" ? <Check className="w-4 h-4" /> : <span>!</span>}
      {message}
    </div>
  );
}

export default function SettingsManager({ general, seo, sitemap, indexing, homepage }: SettingsManagerProps) {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [generalStatus, setGeneralStatus] = useState<SaveStatus>("idle");
  const [seoStatus, setSeoStatus] = useState<SaveStatus>("idle");
  const [sitemapStatus, setSitemapStatus] = useState<SaveStatus>("idle");
  const [indexingStatus, setIndexingStatus] = useState<SaveStatus>("idle");
  const [homepageStatus, setHomepageStatus] = useState<SaveStatus>("idle");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveGeneral = async (formData: FormData) => {
    setGeneralStatus("saving");
    try {
      const result = await saveSetting("general_settings", JSON.stringify({
        siteName: formData.get("siteName") as string,
        siteDescription: formData.get("siteDescription") as string,
        logoUrl: formData.get("logoUrl") as string,
        announcementText: formData.get("announcementText") as string,
        announcementLink: formData.get("announcementLink") as string,
        announcementEnabled: formData.get("announcementEnabled") === "on",
        tickerEnabled: formData.get("tickerEnabled") === "on",
        tickerText: formData.get("tickerText") as string,
        twitterUrl: formData.get("twitterUrl") as string,
        facebookUrl: formData.get("facebookUrl") as string,
        linkedinUrl: formData.get("linkedinUrl") as string,
      }));
      if (result.success) {
        setGeneralStatus("saved");
        showToast("General settings saved successfully!", "success");
      } else {
        setGeneralStatus("error");
        showToast("Failed to save general settings.", "error");
      }
    } catch {
      setGeneralStatus("error");
      showToast("An error occurred while saving.", "error");
    }
    setTimeout(() => setGeneralStatus("idle"), 2000);
  };

  const handleSaveSEO = async (formData: FormData) => {
    setSeoStatus("saving");
    try {
      const result = await saveSetting("seo_settings", JSON.stringify({
        metaTitleTemplate: formData.get("metaTitleTemplate") as string,
        metaDescription: formData.get("metaDescription") as string,
      }));
      if (result.success) {
        setSeoStatus("saved");
        showToast("SEO settings saved successfully!", "success");
      } else {
        setSeoStatus("error");
        showToast("Failed to save SEO settings.", "error");
      }
    } catch {
      setSeoStatus("error");
      showToast("An error occurred while saving.", "error");
    }
    setTimeout(() => setSeoStatus("idle"), 2000);
  };

  const handleSaveSitemap = async (formData: FormData) => {
    setSitemapStatus("saving");
    try {
      const result = await saveSetting("sitemap_settings", JSON.stringify({
        posts: formData.get("posts") === "on",
        pages: formData.get("pages") === "on",
        categories: formData.get("categories") === "on",
      }));
      if (result.success) {
        setSitemapStatus("saved");
        showToast("Sitemap settings saved successfully!", "success");
      } else {
        setSitemapStatus("error");
        showToast("Failed to save sitemap settings.", "error");
      }
    } catch {
      setSitemapStatus("error");
      showToast("An error occurred while saving.", "error");
    }
    setTimeout(() => setSitemapStatus("idle"), 2000);
  };

  const handleSaveIndexing = async (formData: FormData) => {
    setIndexingStatus("saving");
    try {
      const result = await saveSetting("indexing_settings", JSON.stringify({
        discourageIndexing: formData.get("discourageIndexing") === "on",
      }));
      if (result.success) {
        setIndexingStatus("saved");
        showToast("Indexing settings saved successfully!", "success");
      } else {
        setIndexingStatus("error");
        showToast("Failed to save indexing settings.", "error");
      }
    } catch {
      setIndexingStatus("error");
      showToast("An error occurred while saving.", "error");
    }
    setTimeout(() => setIndexingStatus("idle"), 2000);
  };

  const handleSaveHomepage = async (formData: FormData) => {
    setHomepageStatus("saving");
    try {
      const result = await saveSetting("homepage_settings", JSON.stringify({
        showCategoryBar: formData.get("showCategoryBar") === "on",
      }));
      if (result.success) {
        setHomepageStatus("saved");
        showToast("Homepage settings saved successfully!", "success");
      } else {
        setHomepageStatus("error");
        showToast("Failed to save homepage settings.", "error");
      }
    } catch {
      setHomepageStatus("error");
      showToast("An error occurred while saving.", "error");
    }
    setTimeout(() => setHomepageStatus("idle"), 2000);
  };

  const SaveBtn = ({ status, label }: { status: SaveStatus; label: string }) => (
    <button
      type="submit"
      disabled={status === "saving"}
      className="bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors self-end px-6 disabled:opacity-60"
    >
      {status === "saving" ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
      ) : status === "saved" ? (
        <><Check className="w-4 h-4" /> Saved!</>
      ) : (
        <><Save className="w-4 h-4" /> {label}</>
      )}
    </button>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col gap-8 max-w-4xl select-none">
        <div className="pb-6 border-b border-border-subtle">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
            General Settings
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Configure site identity, announcement bars, news ticker, SEO, sitemap, and indexing.
          </p>
        </div>

        {/* General Settings */}
        <form action={handleSaveGeneral} className="bg-white border border-border-subtle p-8 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <Globe className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Site Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Site Name</label>
              <input type="text" name="siteName" defaultValue={general.siteName || "Chronicle"} className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Logo URL</label>
              <input type="text" name="logoUrl" defaultValue={general.logoUrl || ""} placeholder="https://example.com/logo.svg" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Site Description / Tagline</label>
              <textarea name="siteDescription" rows={2} defaultValue={general.siteDescription || ""} className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Twitter / X URL</label>
              <input type="url" name="twitterUrl" defaultValue={general.twitterUrl || ""} placeholder="https://x.com/username" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Facebook URL</label>
              <input type="url" name="facebookUrl" defaultValue={general.facebookUrl || ""} placeholder="https://facebook.com/page" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">LinkedIn URL</label>
              <input type="url" name="linkedinUrl" defaultValue={general.linkedinUrl || ""} placeholder="https://linkedin.com/company/page" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Announcement Bar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                <input type="checkbox" name="announcementEnabled" defaultChecked={general.announcementEnabled ?? true} className="w-4 h-4 text-brand-primary border-border-subtle rounded" />
                Enable Announcement Bar
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                <input type="checkbox" name="tickerEnabled" defaultChecked={general.tickerEnabled ?? true} className="w-4 h-4 text-brand-primary border-border-subtle rounded" />
                Enable Breaking News Ticker
              </label>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Announcement Text</label>
              <input type="text" name="announcementText" defaultValue={general.announcementText || ""} placeholder="e.g. Introducing Chronicle CMS v1.0" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Announcement Link URL</label>
              <input type="text" name="announcementLink" defaultValue={general.announcementLink || ""} placeholder="/technology/introducing-chronicle" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Breaking News Ticker Text <span className="normal-case font-normal">(separate items with • bullet)</span>
              </label>
              <textarea name="tickerText" rows={3} defaultValue={general.tickerText || ""} placeholder="Breaking: Markets rally • Tech sector surges" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-none" />
            </div>
          </div>

          <SaveBtn status={generalStatus} label="Save General Settings" />
        </form>

        {/* Homepage Settings */}
        <form action={handleSaveHomepage} className="bg-white border border-border-subtle p-8 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <Globe className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Homepage Layout</h3>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="showCategoryBar" defaultChecked={homepage?.showCategoryBar !== false} className="w-4 h-4 text-brand-primary border-border-subtle rounded" />
              <div>
                <span className="text-xs font-bold text-gray-700">Show &ldquo;All Topics&rdquo; category bar</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Display the sticky category navigation bar on the homepage</p>
              </div>
            </label>
          </div>
          <SaveBtn status={homepageStatus} label="Save Homepage Settings" />
        </form>

        {/* SEO Settings */}
        <form action={handleSaveSEO} className="bg-white border border-border-subtle p-8 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <Settings className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Global SEO Defaults</h3>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Title Template <span className="normal-case font-normal">(use %s for page title)</span>
              </label>
              <input type="text" name="metaTitleTemplate" defaultValue={seo.metaTitleTemplate || "%s | Chronicle"} className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Default Meta Description</label>
              <textarea name="metaDescription" rows={2} defaultValue={seo.metaDescription || ""} placeholder="Fallback site-wide meta description" className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-none" />
            </div>
          </div>
          <SaveBtn status={seoStatus} label="Save SEO Settings" />
        </form>

        {/* Indexing Settings */}
        <form action={handleSaveIndexing} className="bg-white border border-border-subtle p-8 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <Shield className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Search Engine Visibility</h3>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="discourageIndexing" defaultChecked={indexing.discourageIndexing} className="w-4 h-4 mt-0.5 text-amber-600 border-amber-300 rounded focus:ring-amber-500" />
              <div>
                <span className="text-xs font-bold text-amber-900">Discourage search engines from indexing this site</span>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  Enable this during development, staging, or pre-launch to prevent Google and other search engines from indexing your site.
                  This adds a <code className="bg-amber-100 px-1 rounded">noindex, nofollow</code> directive to your robots.txt.
                </p>
              </div>
            </label>
          </div>
          <SaveBtn status={indexingStatus} label="Save Indexing Settings" />
        </form>

        {/* Sitemap Settings */}
        <form action={handleSaveSitemap} className="bg-white border border-border-subtle p-8 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <Map className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Sitemap Configuration</h3>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed -mt-2">
            Control which content types are included in your XML sitemap at <code className="bg-gray-100 px-1 rounded">/sitemap.xml</code>. Only published content is included.
          </p>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="posts" defaultChecked={sitemap.posts ?? true} className="w-4 h-4 text-brand-primary border-border-subtle rounded" />
              <div>
                <span className="text-xs font-bold text-gray-700">Include Posts</span>
                <p className="text-[10px] text-gray-400 mt-0.5">All published articles will appear in the sitemap</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="pages" defaultChecked={sitemap.pages ?? true} className="w-4 h-4 text-brand-primary border-border-subtle rounded" />
              <div>
                <span className="text-xs font-bold text-gray-700">Include Pages</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Static pages like About, Contact, etc.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="categories" defaultChecked={sitemap.categories ?? true} className="w-4 h-4 text-brand-primary border-border-subtle rounded" />
              <div>
                <span className="text-xs font-bold text-gray-700">Include Categories</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Category archive pages will appear in the sitemap</p>
              </div>
            </label>
          </div>
          <SaveBtn status={sitemapStatus} label="Save Sitemap Settings" />
        </form>
      </div>
    </>
  );
}
