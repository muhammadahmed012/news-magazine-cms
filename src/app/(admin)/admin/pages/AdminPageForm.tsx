"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPage, updatePage } from "@/actions/admin-pages";
import { Save, ArrowLeft, FileSearch } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SeoAnalysis from "@/components/admin/SeoAnalysis";

const Editor = dynamic(() => import("@/components/admin/Editor"), { ssr: false });

export default function AdminPageForm({ initialData, session }: { initialData?: any, session: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [focusKeywords, setFocusKeywords] = useState(initialData?.focusKeywords || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [schemaType, setSchemaType] = useState(initialData?.schemaType || "WebPage");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = {
      title,
      slug,
      content,
      status,
      seoTitle,
      seoDescription,
      focusKeywords,
      canonicalUrl,
      schemaType,
      authorId: session?.user?.id,
    };

    let res;
    if (initialData) {
      res = await updatePage(initialData.id, data);
    } else {
      res = await createPage(data);
    }

    if (res?.success) {
      router.push("/admin/pages");
      router.refresh();
    } else {
      alert("Error saving page: " + (res?.error || "Unknown error"));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 text-gray-400 hover:text-brand-primary bg-bg-light hover:bg-brand-primary/10 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-text-primary">
            {initialData ? "Edit Page" : "Add New Page"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Page"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Page Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. About Us"
              className="w-full text-sm font-semibold px-4 py-3 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Content</label>
            <div className="border border-border-subtle rounded-md overflow-hidden bg-white min-h-[400px]">
              <Editor content={content} onChange={setContent} />
            </div>
          </div>

          <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3 flex items-center gap-1.5">
              <FileSearch className="w-4.5 h-4.5 text-brand-primary" /> SEO & Schema Settings
            </h3>

            <SeoAnalysis
              title={title}
              content={content}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              focusKeywords={focusKeywords}
              slug={slug}
            />

            <div className="border-t border-border-subtle pt-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">SEO Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Meta title override"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Focus Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. about, company, team"
                    value={focusKeywords}
                    onChange={(e) => setFocusKeywords(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Enter rich, semantic SEO snippet description..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Canonical URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/original-page"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Schema Markup Type</label>
                  <select
                    value={schemaType}
                    onChange={(e) => setSchemaType(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none focus:border-brand-primary"
                  >
                    <option value="WebPage">WebPage (Default)</option>
                    <option value="AboutPage">AboutPage</option>
                    <option value="ContactPage">ContactPage</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="HowTo">HowTo</option>
                    <option value="ItemPage">ItemPage</option>
                    <option value="ProfilePage">ProfilePage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-md shadow-sm border border-border-subtle flex flex-col gap-5">
            <h3 className="font-bold text-sm border-b border-border-subtle pb-3">Publish Settings</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none bg-bg-light"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none bg-bg-light"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
