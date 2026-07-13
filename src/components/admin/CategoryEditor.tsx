"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Code from "@tiptap/extension-code";
import MediaPicker from "./MediaPicker";
import {
  Save,
  Plus,
  Trash2,
  Pencil,
  X,
  ChevronDown,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImageIcon,
  Highlighter,
  Minus,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  parentId: string | null;
  icon: string | null;
  color: string | null;
  layoutStyle: string;
  parent?: { name: string } | null;
  _count?: { posts: number; children: number };
}

interface CategoryEditorProps {
  categories: Category[];
  onCreateCategory: (data: {
    name: string;
    description: string;
    longDescription: string;
    parentId: string;
    icon: string;
    color: string;
    layoutStyle: string;
  }) => Promise<void>;
  onUpdateCategory: (data: {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    parentId: string;
    icon: string;
    color: string;
    layoutStyle: string;
  }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export default function CategoryEditor({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryEditorProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#5F4A8B");
  const [layoutStyle, setLayoutStyle] = useState("grid");
  const [saving, setSaving] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const formatRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      TiptapImage,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      CharacterCount,
      HorizontalRule,
      Code,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "cat-editor-content",
      },
    },
  });

  useEffect(() => {
    if (editingCategory && editor) {
      setName(editingCategory.name);
      setDescription(editingCategory.description || "");
      setParentId(editingCategory.parentId || "");
      setIcon(editingCategory.icon || "");
      setColor(editingCategory.color || "#5F4A8B");
      setLayoutStyle(editingCategory.layoutStyle || "grid");
      editor.commands.setContent(editingCategory.longDescription || "");
    }
  }, [editingCategory, editor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) setShowFormatMenu(false);
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) setShowLinkMenu(false);
      if (imageRef.current && !imageRef.current.contains(e.target as Node)) setShowImageMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setParentId("");
    setIcon("");
    setColor("#5F4A8B");
    setLayoutStyle("grid");
    if (editor) editor.commands.setContent("");
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const longDescription = editor ? editor.getHTML() : "";

    try {
      if (editingCategory) {
        await onUpdateCategory({
          id: editingCategory.id,
          name,
          description,
          longDescription,
          parentId,
          icon,
          color,
          layoutStyle,
        });
        resetForm();
      } else {
        await onCreateCategory({
          name,
          description,
          longDescription,
          parentId,
          icon,
          color,
          layoutStyle,
        });
        setName("");
        setDescription("");
        setParentId("");
        setIcon("");
        setColor("#5F4A8B");
        setLayoutStyle("grid");
        if (editor) editor.commands.setContent("");
      }
    } finally {
      setSaving(false);
    }
  };

  const rootCategories = categories.filter((c) => !c.parentId);

  const currentFormat = () => {
    if (editor?.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor?.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor?.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor?.isActive("blockquote")) return "Blockquote";
    if (editor?.isActive("codeBlock")) return "Code Block";
    return "Paragraph";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Category Tree */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-bg-light/40 border-b border-border-subtle flex items-center gap-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Category Hierarchy ({categories.length} total)
          </h3>
        </div>

        <div className="divide-y divide-border-subtle">
          {rootCategories.map((cat) => {
            const children = categories.filter((c) => c.parentId === cat.id);
            return (
              <div key={cat.id}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-bg-light/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || "#5F4A8B" }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-text-primary">{cat.name}</span>
                        <span className="text-[9px] font-bold text-gray-400 bg-bg-light px-1.5 py-0.5 rounded border border-border-subtle">
                          /{cat.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400 font-semibold">
                        <span>{cat._count?.posts || 0} posts</span>
                        <span>•</span>
                        <span>{cat._count?.children || 0} subcategories</span>
                        <span>•</span>
                        <span className="capitalize">{cat.layoutStyle} layout</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 text-gray-300 hover:text-brand-primary transition-colors rounded"
                      title="Edit category"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <form
                      action={async () => { await onDeleteCategory(cat.id); }}
                    >
                      <button
                        type="submit"
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                {children.map((child) => (
                  <div
                    key={child.id}
                    className="pl-12 pr-6 py-3 flex items-center justify-between bg-bg-light/20 border-t border-border-subtle hover:bg-bg-light/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: child.color || "#5F4A8B" }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{child.name}</span>
                          <span className="text-[9px] font-bold text-gray-400 bg-bg-light px-1.5 py-0.5 rounded border border-border-subtle">
                            /{child.slug}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{child._count?.posts || 0} posts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(child)}
                        className="p-1.5 text-gray-300 hover:text-brand-primary transition-colors rounded"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <form
                        action={async () => { await onDeleteCategory(child.id); }}
                      >
                        <button
                          type="submit"
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {categories.length === 0 && (
            <p className="text-center py-12 text-xs text-gray-400 italic">No categories created yet.</p>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      <div className="lg:col-span-5">
        <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-border-subtle pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
              {editingCategory ? `Edit: ${editingCategory.name}` : "Create New Category"}
            </h3>
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cryptocurrency"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short category summary..."
                className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Full Description (shown at bottom of category page)</label>
              <style dangerouslySetInnerHTML={{ __html: `
                .cat-editor-content { min-height: 200px; padding: 16px 20px; outline: none; font-size: 14px; line-height: 1.7; color: #1f2937; }
                .cat-editor-content:focus { outline: none; }
                .cat-editor-content h1 { font-size: 1.8em; font-weight: 800; margin: 0.5em 0; color: #111827; }
                .cat-editor-content h2 { font-size: 1.4em; font-weight: 700; margin: 0.5em 0; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
                .cat-editor-content h3 { font-size: 1.15em; font-weight: 700; margin: 0.5em 0; color: #1f2937; }
                .cat-editor-content h4 { font-size: 1em; font-weight: 600; margin: 0.5em 0; color: #374151; }
                .cat-editor-content h5 { font-size: 0.95em; font-weight: 600; margin: 0.5em 0; color: #374151; }
                .cat-editor-content h6 { font-size: 0.85em; font-weight: 600; margin: 0.5em 0; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .cat-editor-content p { margin: 0 0 0.75em; }
                .cat-editor-content ul, .cat-editor-content ol { margin: 0 0 0.75em; padding-left: 1.5em; }
                .cat-editor-content li { margin-bottom: 0.2em; }
                .cat-editor-content blockquote { border-left: 4px solid #5F4A8B; margin: 0.75em 0; padding: 0.5em 1em; background: #f9fafb; color: #4b5563; font-style: italic; border-radius: 0 4px 4px 0; }
                .cat-editor-content pre { background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; margin: 0.75em 0; }
                .cat-editor-content code { background: #f3f4f6; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; color: #5F4A8B; }
                .cat-editor-content pre code { background: none; padding: 0; color: inherit; }
                .cat-editor-content hr { border: none; border-top: 2px solid #e5e7eb; margin: 1em 0; }
                .cat-editor-content a { color: #5F4A8B; text-decoration: underline; }
                .cat-editor-content img { max-width: 100%; border-radius: 6px; margin: 0.75em 0; }
                .cat-editor-content mark { background: #fef08a; padding: 1px 3px; border-radius: 2px; }
                .cat-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 6px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; min-height: 36px; }
                .cat-sep { width: 1px; height: 20px; background: #d1d5db; margin: 0 3px; flex-shrink: 0; }
                .cat-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; border: none; background: transparent; color: #4b5563; cursor: pointer; transition: all 0.1s; flex-shrink: 0; }
                .cat-btn:hover { background: #e5e7eb; color: #111827; }
                .cat-btn.active { background: #5F4A8B; color: #fff; }
                .cat-dd-wrap { position: relative; }
                .cat-dd { position: absolute; top: 100%; left: 0; z-index: 50; margin-top: 2px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 4px 0; min-width: 160px; }
                .cat-dd-item { display: block; width: 100%; padding: 5px 10px; text-align: left; font-size: 12px; font-weight: 500; color: #374151; background: none; border: none; cursor: pointer; white-space: nowrap; }
                .cat-dd-item:hover { background: #f3f4f6; color: #111827; }
                .cat-dd-item.active { background: #ede9fe; color: #5F4A8B; font-weight: 700; }
                .cat-dd-sep { height: 1px; background: #e5e7eb; margin: 4px 0; }
                .cat-fmt-btn { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; color: #374151; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.1s; white-space: nowrap; }
                .cat-fmt-btn:hover { border-color: #9ca3af; background: #f9fafb; }
                .cat-source { width: 100%; min-height: 200px; padding: 16px 20px; font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; line-height: 1.6; color: #1f2937; background: #fff; border: none; outline: none; resize: vertical; }
              ` }} />

              <div className="border border-border-subtle rounded-md overflow-hidden">
                <div className="cat-toolbar">
                  <div className="cat-dd-wrap" ref={formatRef}>
                    <button type="button" className="cat-fmt-btn" onClick={() => setShowFormatMenu(!showFormatMenu)}>
                      {currentFormat()}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showFormatMenu && (
                      <div className="cat-dd">
                        <button type="button" className={`cat-dd-item ${!editor?.isActive("heading") && !editor?.isActive("blockquote") && !editor?.isActive("codeBlock") ? "active" : ""}`} onClick={() => { editor?.chain().focus().setParagraph().run(); setShowFormatMenu(false); }}>Paragraph</button>
                        <div className="cat-dd-sep" />
                        {[1,2,3,4,5,6].map((l) => (
                          <button key={l} type="button" className={`cat-dd-item ${editor?.isActive("heading", { level: l }) ? "active" : ""}`} onClick={() => { editor?.chain().focus().toggleHeading({ level: l as any }).run(); setShowFormatMenu(false); }}>Heading {l}</button>
                        ))}
                        <div className="cat-dd-sep" />
                        <button type="button" className={`cat-dd-item ${editor?.isActive("blockquote") ? "active" : ""}`} onClick={() => { editor?.chain().focus().toggleBlockquote().run(); setShowFormatMenu(false); }}>Blockquote</button>
                        <button type="button" className={`cat-dd-item ${editor?.isActive("codeBlock") ? "active" : ""}`} onClick={() => { editor?.chain().focus().toggleCodeBlock().run(); setShowFormatMenu(false); }}>Code Block</button>
                      </div>
                    )}
                  </div>

                  <div className="cat-sep" />

                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`cat-btn ${editor?.isActive("bold") ? "active" : ""}`} title="Bold">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`cat-btn ${editor?.isActive("italic") ? "active" : ""}`} title="Italic">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`cat-btn ${editor?.isActive("underline") ? "active" : ""}`} title="Underline">
                    <UnderlineIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`cat-btn ${editor?.isActive("highlight") ? "active" : ""}`} title="Highlight">
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>

                  <div className="cat-sep" />

                  <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`cat-btn ${editor?.isActive("bulletList") ? "active" : ""}`} title="Bulleted List">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`cat-btn ${editor?.isActive("orderedList") ? "active" : ""}`} title="Numbered List">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="cat-sep" />

                  <button type="button" onClick={() => editor?.chain().focus().setTextAlign("left").run()} className={`cat-btn ${editor?.isActive({ textAlign: "left" }) ? "active" : ""}`} title="Align Left">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().setTextAlign("center").run()} className={`cat-btn ${editor?.isActive({ textAlign: "center" }) ? "active" : ""}`} title="Align Center">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().setTextAlign("right").run()} className={`cat-btn ${editor?.isActive({ textAlign: "right" }) ? "active" : ""}`} title="Align Right">
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="cat-sep" />

                  <div className="cat-dd-wrap" ref={linkRef}>
                    <button type="button" onClick={() => { if (editor?.isActive("link")) { editor?.chain().focus().unsetLink().run(); } else { setShowLinkMenu(!showLinkMenu); } }} className={`cat-btn ${editor?.isActive("link") ? "active" : ""}`} title="Insert Link">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                    {showLinkMenu && (
                      <div className="cat-dd" style={{ minWidth: 240, padding: 10 }}>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">URL</label>
                          <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-brand-primary" onKeyDown={(e) => e.key === "Enter" && (linkUrl && editor?.chain().focus().setLink({ href: linkUrl }).run(), setLinkUrl(""), setShowLinkMenu(false))} autoFocus />
                          <button type="button" onClick={() => { linkUrl && editor?.chain().focus().setLink({ href: linkUrl }).run(); setLinkUrl(""); setShowLinkMenu(false); }} className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors">Apply</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="cat-dd-wrap" ref={imageRef}>
                    <button type="button" onClick={() => setShowImageMenu(!showImageMenu)} className="cat-btn" title="Insert Image">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                    {showImageMenu && (
                      <div className="cat-dd" style={{ minWidth: 260, padding: 10 }}>
                        <div className="flex flex-col gap-2">
                          <button type="button" onClick={() => { setShowMediaPicker(true); setShowImageMenu(false); }} className="w-full text-left px-3 py-2 bg-brand-primary/5 border border-brand-primary/20 rounded text-xs font-bold text-brand-primary hover:bg-brand-primary/10 transition-colors flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5" /> Browse Media Library
                          </button>
                          <div className="cat-dd-sep" />
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Or paste URL</label>
                          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-brand-primary" onKeyDown={(e) => e.key === "Enter" && (imageUrl && editor?.chain().focus().setImage({ src: imageUrl }).run(), setImageUrl(""), setShowImageMenu(false))} autoFocus />
                          <button type="button" onClick={() => { imageUrl && editor?.chain().focus().setImage({ src: imageUrl }).run(); setImageUrl(""); setShowImageMenu(false); }} className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors">Insert</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="cat-btn" title="Horizontal Line">
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="cat-sep" />

                  <button type="button" onClick={() => editor?.chain().focus().toggleCode().run()} className={`cat-btn ${editor?.isActive("code") ? "active" : ""}`} title="Inline Code">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
                  </button>
                </div>

                <div className="border border-border-subtle border-t-0 rounded-b-md overflow-hidden">
                  <EditorContent editor={editor} className="cat-editor-content outline-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                >
                  <option value="">None (Root)</option>
                  {rootCategories.filter((c) => c.id !== editingCategory?.id).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Layout Style</label>
                <select
                  value={layoutStyle}
                  onChange={(e) => setLayoutStyle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md text-gray-600 outline-none"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                  <option value="editorial">Editorial</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Lucide Icon Name</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. Laptop, Globe, Cpu"
                  className="w-full text-xs font-semibold px-4 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Accent Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 border border-border-subtle rounded-md cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="mt-2 bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editingCategory ? (
                <><Save className="w-4 h-4" /> Update Category</>
              ) : (
                <><Plus className="w-4 h-4" /> Create Category</>
              )}
            </button>
          </form>
        </div>

        {showMediaPicker && (
          <MediaPicker
            onSelect={(url) => { editor?.chain().focus().setImage({ src: url }).run(); }}
            onClose={() => setShowMediaPicker(false)}
          />
        )}
      </div>
    </div>
  );
}
