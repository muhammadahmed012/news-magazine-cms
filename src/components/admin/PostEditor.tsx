"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Code from "@tiptap/extension-code";
import { FaqNode } from "./extensions/FaqNode";
import { upsertPost } from "@/actions/admin-posts";
import SeoAnalysis from "@/components/admin/SeoAnalysis";
import MediaPicker from "@/components/admin/MediaPicker";
import {
  Save,
  Settings,
  Image as ImageIcon,
  Eye,
  Type,
  FileSearch,
  History,
  Link as LinkIcon,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Highlighter,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string | null;
}

interface PostEditorProps {
  post?: any;
  categories: Category[];
  authors: Author[];
}

export default function PostEditor({ post, categories, authors }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title || "");
  const [subtitle, setSubtitle] = useState(post?.subtitle || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ? new Date(post.publishedAt).toISOString().split("T")[0] : "");
  const [readingTime, setReadingTime] = useState(post?.readingTime || 5);

  const [authorId, setAuthorId] = useState(post?.authorId || authors[0]?.id || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || "");

  const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false);
  const [isBreaking, setIsBreaking] = useState(post?.isBreaking || false);
  const [isEditorPick, setIsEditorPick] = useState(post?.isEditorPick || false);
  const [isTrending, setIsTrending] = useState(post?.isTrending || false);
  const [isSponsored, setIsSponsored] = useState(post?.isSponsored || false);
  const [isSticky, setIsSticky] = useState(post?.isSticky || false);

  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");
  const [focusKeywords, setFocusKeywords] = useState(post?.focusKeywords || "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || "");
  const [schemaType, setSchemaType] = useState(post?.schemaType || "NewsArticle");

  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(post?.tags?.map((t: any) => t.id) || []);
  const [newTagName, setNewTagName] = useState("");

  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"inline" | "featured">("inline");
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const formatRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TiptapImage,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      CharacterCount,
      HorizontalRule,
      Code,
      FaqNode,
    ],
    content: post?.content ? JSON.parse(post.content) : { type: "doc", content: [] },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) setShowFormatMenu(false);
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) setShowLinkMenu(false);
      if (imageRef.current && !imageRef.current.contains(e.target as Node)) setShowImageMenu(false);
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) setShowTableMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/admin/tags", { credentials: "include" })
      .then(r => r.json())
      .then(d => setAllTags(d.tags || []))
      .catch(() => {});
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const data = await res.json();
      if (data.tag) {
        setAllTags(prev => [...prev, data.tag]);
        setSelectedTagIds(prev => [...prev, data.tag.id]);
        setNewTagName("");
      }
    } catch (e) {
      console.error("Failed to create tag:", e);
    }
  };

  const toggleSource = useCallback(() => {
    if (!editor) return;
    if (showSource) {
      editor.commands.setContent(sourceHtml);
      setShowSource(false);
    } else {
      setSourceHtml(editor.getHTML());
      setShowSource(true);
    }
  }, [editor, showSource, sourceHtml]);

  const generateSlug = () => {
    const clean = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(clean);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and Slug are required properties.");
      return;
    }

    setLoading(true);
    setError(null);

    const contentJson = editor ? JSON.stringify(editor.getJSON()) : "{}";

    try {
      const result = await upsertPost({
        id: post?.id,
        title,
        subtitle,
        slug,
        excerpt,
        content: contentJson,
        featuredImage,
        status,
        publishedAt: status === "SCHEDULED" && publishedAt ? new Date(publishedAt) : null,
        readingTime: Number(readingTime),
        authorId,
        categoryId,
        isFeatured,
        isBreaking,
        isEditorPick,
        isTrending,
        isSponsored,
        isSticky,
        seoTitle,
        seoDescription,
        focusKeywords,
        canonicalUrl,
        schemaType,
        tagIds: selectedTagIds
      });

      if (result.success) {
        router.push("/admin/posts");
      } else {
        setError(result.error || "Failed to save post.");
      }
    } catch (err) {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = editor ? editor.getText().split(/\s+/).filter(Boolean).length : 0;
  const charCount = editor ? editor.storage.characterCount.characters() : 0;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 pb-16 select-none">
      <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <h1 className="font-serif font-black text-2xl tracking-tight text-text-primary">
            {post ? "Edit Article" : "Write New Article"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            className="text-xs font-bold px-3.5 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none focus:border-brand-primary"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {status === "SCHEDULED" && (
            <input
              type="date"
              required
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-md text-xs font-bold tracking-wide transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Article"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-bold p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3 flex items-center gap-1.5">
              <Type className="w-4.5 h-4.5 text-brand-primary" /> Core Information
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Article Title</label>
              <input
                type="text"
                required
                placeholder="Enter a compelling, traffic-driving title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">URL Slug</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="slug-path-here"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="bg-bg-light border border-border-subtle px-3 py-2 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle / Deck</label>
                <input
                  type="text"
                  placeholder="Supporting secondary headline text..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            <style dangerouslySetInnerHTML={{ __html: `
              .pe-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 6px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; min-height: 40px; }
              .pe-sep { width: 1px; height: 22px; background: #d1d5db; margin: 0 4px; flex-shrink: 0; }
              .pe-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 4px; border: none; background: transparent; color: #4b5563; cursor: pointer; transition: all 0.1s; flex-shrink: 0; }
              .pe-btn:hover { background: #e5e7eb; color: #111827; }
              .pe-btn.active { background: #5F4A8B; color: #fff; }
              .pe-btn.disabled { opacity: 0.3; pointer-events: none; }
              .pe-dd-wrap { position: relative; }
              .pe-dd { position: absolute; top: 100%; left: 0; z-index: 50; margin-top: 2px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 4px 0; min-width: 180px; }
              .pe-dd-item { display: block; width: 100%; padding: 6px 12px; text-align: left; font-size: 12px; font-weight: 500; color: #374151; background: none; border: none; cursor: pointer; white-space: nowrap; }
              .pe-dd-item:hover { background: #f3f4f6; color: #111827; }
              .pe-dd-item.active { background: #ede9fe; color: #5F4A8B; font-weight: 700; }
              .pe-dd-sep { height: 1px; background: #e5e7eb; margin: 4px 0; }
              .pe-fmt-btn { display: inline-flex; align-items: center; gap: 4px; height: 30px; padding: 0 10px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; color: #374151; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.1s; white-space: nowrap; }
              .pe-fmt-btn:hover { border-color: #9ca3af; background: #f9fafb; }
              .pe-content { min-height: 350px; padding: 24px 32px; outline: none; font-size: 15px; line-height: 1.75; color: #1f2937; }
              .pe-content h1 { font-size: 2em; font-weight: 800; margin: 0.67em 0; line-height: 1.2; color: #111827; }
              .pe-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; line-height: 1.3; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
              .pe-content h3 { font-size: 1.25em; font-weight: 700; margin: 0.75em 0; line-height: 1.3; color: #1f2937; }
              .pe-content h4 { font-size: 1.1em; font-weight: 600; margin: 0.75em 0; color: #374151; }
              .pe-content h5 { font-size: 1em; font-weight: 600; margin: 0.75em 0; color: #374151; }
              .pe-content h6 { font-size: 0.9em; font-weight: 600; margin: 0.75em 0; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
              .pe-content p { margin: 0 0 1em; }
              .pe-content ul, .pe-content ol { margin: 0 0 1em; padding-left: 1.5em; }
              .pe-content li { margin-bottom: 0.25em; }
              .pe-content blockquote { border-left: 4px solid #5F4A8B; margin: 1em 0; padding: 0.75em 1.25em; background: #f9fafb; color: #4b5563; font-style: italic; border-radius: 0 4px 4px 0; }
              .pe-content pre { background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 13px; margin: 1em 0; }
              .pe-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; color: #5F4A8B; }
              .pe-content pre code { background: none; padding: 0; color: inherit; }
              .pe-content hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
              .pe-content a { color: #5F4A8B; text-decoration: underline; }
              .pe-content img { max-width: 100%; border-radius: 6px; margin: 1em 0; }
              .pe-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
              .pe-content th, .pe-content td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
              .pe-content th { background: #f9fafb; font-weight: 600; }
              .pe-content mark { background: #fef08a; padding: 1px 3px; border-radius: 2px; }
              .pe-statusbar { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; font-weight: 500; }
              .pe-source { width: 100%; min-height: 350px; padding: 24px 32px; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.6; color: #1f2937; background: #fff; border: none; outline: none; resize: vertical; }
              .pe-mode { display: inline-flex; border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden; }
              .pe-mode-btn { padding: 3px 10px; font-size: 11px; font-weight: 600; border: none; background: #fff; color: #6b7280; cursor: pointer; transition: all 0.1s; }
              .pe-mode-btn.active { background: #5F4A8B; color: #fff; }
              .pe-mode-btn:first-child { border-right: 1px solid #d1d5db; }
            ` }} />

            <div className="pe-toolbar">
              <div className="pe-dd-wrap" ref={formatRef}>
                <button type="button" className="pe-fmt-btn" onClick={() => setShowFormatMenu(!showFormatMenu)}>
                  {editor?.isActive("heading", { level: 1 }) ? "Heading 1" : editor?.isActive("heading", { level: 2 }) ? "Heading 2" : editor?.isActive("heading", { level: 3 }) ? "Heading 3" : editor?.isActive("heading", { level: 4 }) ? "Heading 4" : editor?.isActive("heading", { level: 5 }) ? "Heading 5" : editor?.isActive("heading", { level: 6 }) ? "Heading 6" : editor?.isActive("blockquote") ? "Blockquote" : editor?.isActive("codeBlock") ? "Code Block" : "Paragraph"}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showFormatMenu && (
                  <div className="pe-dd">
                    <button type="button" className={`pe-dd-item ${!editor?.isActive("heading") && !editor?.isActive("blockquote") && !editor?.isActive("codeBlock") ? "active" : ""}`} onClick={() => { editor?.chain().focus().setParagraph().run(); setShowFormatMenu(false); }}>Paragraph</button>
                    <div className="pe-dd-sep" />
                    {[1,2,3,4,5,6].map((l) => (
                      <button key={l} type="button" className={`pe-dd-item ${editor?.isActive("heading", { level: l }) ? "active" : ""}`} onClick={() => { editor?.chain().focus().toggleHeading({ level: l as any }).run(); setShowFormatMenu(false); }}>Heading {l}</button>
                    ))}
                    <div className="pe-dd-sep" />
                    <button type="button" className={`pe-dd-item ${editor?.isActive("blockquote") ? "active" : ""}`} onClick={() => { editor?.chain().focus().toggleBlockquote().run(); setShowFormatMenu(false); }}>Blockquote</button>
                    <button type="button" className={`pe-dd-item ${editor?.isActive("codeBlock") ? "active" : ""}`} onClick={() => { editor?.chain().focus().toggleCodeBlock().run(); setShowFormatMenu(false); }}>Code Block</button>
                  </div>
                )}
              </div>

              <div className="pe-sep" />

              <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`pe-btn ${editor?.isActive("bold") ? "active" : ""}`} title="Bold (Ctrl+B)">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`pe-btn ${editor?.isActive("italic") ? "active" : ""}`} title="Italic (Ctrl+I)">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`pe-btn ${editor?.isActive("underline") ? "active" : ""}`} title="Underline (Ctrl+U)">
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()} className={`pe-btn ${editor?.isActive("strike") ? "active" : ""}`} title="Strikethrough">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`pe-btn ${editor?.isActive("highlight") ? "active" : ""}`} title="Highlight">
                <Highlighter className="w-4 h-4" />
              </button>

              <div className="pe-sep" />

              <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`pe-btn ${editor?.isActive("bulletList") ? "active" : ""}`} title="Bulleted List">
                <List className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`pe-btn ${editor?.isActive("orderedList") ? "active" : ""}`} title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="pe-sep" />

              <button type="button" onClick={() => editor?.chain().focus().setTextAlign("left").run()} className={`pe-btn ${editor?.isActive({ textAlign: "left" }) ? "active" : ""}`} title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().setTextAlign("center").run()} className={`pe-btn ${editor?.isActive({ textAlign: "center" }) ? "active" : ""}`} title="Align Center">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().setTextAlign("right").run()} className={`pe-btn ${editor?.isActive({ textAlign: "right" }) ? "active" : ""}`} title="Align Right">
                <AlignRight className="w-4 h-4" />
              </button>

              <div className="pe-sep" />

              <div className="pe-dd-wrap" ref={linkRef}>
                <button type="button" onClick={() => { if (editor?.isActive("link")) { editor?.chain().focus().unsetLink().run(); } else { setShowLinkMenu(!showLinkMenu); } } } className={`pe-btn ${editor?.isActive("link") ? "active" : ""}`} title="Insert Link">
                  <LinkIcon className="w-4 h-4" />
                </button>
                {showLinkMenu && (
                  <div className="pe-dd" style={{ minWidth: 260, padding: 12 }}>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">URL</label>
                      <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="w-full text-xs px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-primary" onKeyDown={(e) => e.key === "Enter" && (linkUrl && editor?.chain().focus().setLink({ href: linkUrl }).run(), setLinkUrl(""), setShowLinkMenu(false))} autoFocus />
                      <button type="button" onClick={() => { linkUrl && editor?.chain().focus().setLink({ href: linkUrl }).run(); setLinkUrl(""); setShowLinkMenu(false); }} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors">Apply</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pe-dd-wrap" ref={imageRef}>
                <button type="button" onClick={() => setShowImageMenu(!showImageMenu)} className="pe-btn" title="Insert Image">
                  <ImageIcon className="w-4 h-4" />
                </button>
                {showImageMenu && (
                  <div className="pe-dd" style={{ minWidth: 280, padding: 12 }}>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowMediaPicker(true); setMediaPickerTarget("inline"); setShowImageMenu(false); }}
                        className="w-full text-left px-3 py-2 bg-brand-primary/5 border border-brand-primary/20 rounded text-xs font-bold text-brand-primary hover:bg-brand-primary/10 transition-colors flex items-center gap-2"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Browse Media Library
                      </button>
                      <div className="pe-dd-sep" />
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Or paste URL</label>
                      <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full text-xs px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-primary" onKeyDown={(e) => e.key === "Enter" && (imageUrl && editor?.chain().focus().setImage({ src: imageUrl }).run(), setImageUrl(""), setShowImageMenu(false))} autoFocus />
                      <button type="button" onClick={() => { imageUrl && editor?.chain().focus().setImage({ src: imageUrl }).run(); setImageUrl(""); setShowImageMenu(false); }} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors">Insert</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pe-dd-wrap" ref={tableRef}>
                <button type="button" onClick={() => setShowTableMenu(!showTableMenu)} className="pe-btn" title="Insert Table">
                  <TableIcon className="w-4 h-4" />
                </button>
                {showTableMenu && (
                  <div className="pe-dd" style={{ minWidth: 160, padding: 8 }}>
                    <button type="button" className="pe-dd-item" onClick={() => { editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run(); setShowTableMenu(false); }}>2 × 2</button>
                    <button type="button" className="pe-dd-item" onClick={() => { editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setShowTableMenu(false); }}>3 × 3</button>
                    <button type="button" className="pe-dd-item" onClick={() => { editor?.chain().focus().insertTable({ rows: 3, cols: 5, withHeaderRow: true }).run(); setShowTableMenu(false); }}>3 × 5</button>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="pe-btn" title="Horizontal Line">
                <Minus className="w-4 h-4" />
              </button>

              <div className="pe-sep" />

              <button type="button" onClick={() => editor?.chain().focus().toggleCode().run()} className={`pe-btn ${editor?.isActive("code") ? "active" : ""}`} title="Inline Code">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
              </button>

              <div className="pe-sep" />

              <button type="button" onClick={() => editor?.chain().focus().insertFaq([{ question: "", answer: "" }]).run()} className="pe-btn" title="Insert FAQ Accordion">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
              </button>

              <div className="pe-sep" />

              <button type="button" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} className="pe-btn" title="Undo">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
              </button>
              <button type="button" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} className="pe-btn" title="Redo">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
              </button>

              <div style={{ flex: 1 }} />

              <div className="pe-mode">
                <button type="button" className={`pe-mode-btn ${!showSource ? "active" : ""}`} onClick={() => showSource && toggleSource()}>Visual</button>
                <button type="button" className={`pe-mode-btn ${showSource ? "active" : ""}`} onClick={() => !showSource && toggleSource()}>Text</button>
              </div>
            </div>

            {showSource ? (
              <textarea className="pe-source" value={sourceHtml} onChange={(e) => setSourceHtml(e.target.value)} spellCheck={false} />
            ) : (
              <div className="flex-1 p-0 overflow-y-auto">
                <EditorContent editor={editor} className="pe-content outline-none" />
              </div>
            )}

            <div className="pe-statusbar">
              <div className="flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
              </div>
              <span>Paragraph</span>
            </div>
          </div>

          <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3 flex items-center gap-1.5">
              <FileSearch className="w-4.5 h-4.5 text-brand-primary" /> SEO & Schema Settings
            </h3>

            <SeoAnalysis
              title={title}
              content={editor?.isInitialized ? editor.getHTML() : ""}
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
                    placeholder="e.g. AI, compute, logic"
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
                    placeholder="https://example.com/original-article"
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
                    <option value="NewsArticle">NewsArticle (Default)</option>
                    <option value="BlogPosting">BlogPosting</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="HowTo">HowTo</option>
                    <option value="VideoObject">VideoObject</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3 flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-brand-primary" /> Classifications
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none focus:border-brand-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Reporter / Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle bg-white rounded-md text-gray-600 outline-none focus:border-brand-primary"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Featured Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setShowMediaPicker(true); setMediaPickerTarget("featured"); }}
                  className="bg-bg-light border border-border-subtle px-3 py-2 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors shrink-0 flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Browse
                </button>
              </div>
              {featuredImage && (
                <div className="mt-2 relative rounded overflow-hidden border border-border-subtle aspect-[16/10] bg-gray-100">
                  <img src={featuredImage} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Read Time (min)</label>
                <input
                  type="number"
                  min={1}
                  value={readingTime}
                  onChange={(e) => setReadingTime(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3 flex items-center gap-1.5">
              Tags
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                placeholder="Add new tag..."
                className="flex-1 text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="px-3 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                      isSelected
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-bg-light text-gray-500 border-border-subtle hover:border-brand-primary/30"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {allTags.length === 0 && (
                <p className="text-[10px] text-gray-400 italic">No tags yet. Create one above.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3">
              Editorial Status & Flags
            </h3>

            <div className="flex flex-col gap-3">
              {[
                { label: "Featured Article (Main Hero/Slider)", state: isFeatured, setter: setIsFeatured },
                { label: "Breaking News Ticker Banner", state: isBreaking, setter: setIsBreaking },
                { label: "Editor's Pick Highlight", state: isEditorPick, setter: setIsEditorPick },
                { label: "Trending Feed Stream", state: isTrending, setter: setIsTrending },
                { label: "Sponsored Content Overlay", state: isSponsored, setter: setIsSponsored },
                { label: "Sticky Post (Top of List)", state: isSticky, setter: setIsSticky }
              ].map((flag, index) => (
                <label key={index} className="flex items-center gap-3 text-xs font-bold text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={flag.state}
                    onChange={(e) => flag.setter(e.target.checked)}
                    className="w-4 h-4 border-border-subtle text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {post?.revisions?.length > 0 && (
            <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-brand-primary" /> Revision History ({post.revisions.length})
              </h3>
              <div className="divide-y divide-border-subtle max-h-48 overflow-y-auto pr-1">
                {post.revisions.map((rev: any, rIdx: number) => (
                  <div key={rev.id} className="py-2.5 first:pt-0 text-[10px] font-semibold text-gray-400">
                    <p className="text-text-primary truncate">{rev.title}</p>
                    <p className="mt-0.5">{new Date(rev.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => {
            if (mediaPickerTarget === "featured") {
              setFeaturedImage(url);
            } else {
              editor?.chain().focus().setImage({ src: url }).run();
            }
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </form>
  );
}
