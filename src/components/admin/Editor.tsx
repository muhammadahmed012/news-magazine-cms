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
import { FaqNode } from "./extensions/FaqNode";
import MediaPicker from "./MediaPicker";

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tableMenu, setTableMenu] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "editor-link" },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: "editor-image" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: false }),
      CharacterCount,
      HorizontalRule,
      Code,
      FaqNode,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "editor-content-area",
      },
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) setShowFormatMenu(false);
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) setShowLinkMenu(false);
      if (imageRef.current && !imageRef.current.contains(e.target as Node)) setShowImageMenu(false);
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) setTableMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSource = useCallback(() => {
    if (!editor) return;
    if (showSource) {
      editor.commands.setContent(sourceHtml);
      onChange(sourceHtml);
      setShowSource(false);
    } else {
      setSourceHtml(editor.getHTML());
      setShowSource(true);
    }
  }, [editor, showSource, sourceHtml, onChange]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentFormat = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor.isActive("heading", { level: 6 })) return "Heading 6";
    if (editor.isActive("blockquote")) return "Blockquote";
    if (editor.isActive("codeBlock")) return "Code Block";
    return "Paragraph";
  };

  const setFormat = (level: number | null) => {
    if (level === null) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as any }).run();
    }
    setShowFormatMenu(false);
  };

  const setBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
    setShowFormatMenu(false);
  };

  const setCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
    setShowFormatMenu(false);
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkMenu(false);
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkMenu(false);
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageMenu(false);
    }
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTableMenu(false);
  };

  const wordCount = editor.getText().split(/\s+/).filter(Boolean).length;
  const charCount = editor.storage.characterCount.characters();

  const TB = ({ onClick, active, disabled, children, title }: { onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`wp-tb-btn ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="wp-editor-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .wp-editor-wrapper { display: flex; flex-direction: column; border: 1px solid #d1d5db; border-radius: 0.375rem; overflow: hidden; background: #fff; }
        .wp-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 6px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; min-height: 40px; }
        .wp-toolbar-separator { width: 1px; height: 22px; background: #d1d5db; margin: 0 4px; flex-shrink: 0; }
        .wp-tb-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 4px; border: none; background: transparent; color: #4b5563; cursor: pointer; transition: all 0.1s; flex-shrink: 0; }
        .wp-tb-btn:hover { background: #e5e7eb; color: #111827; }
        .wp-tb-btn.active { background: #5F4A8B; color: #fff; }
        .wp-tb-btn.disabled { opacity: 0.3; pointer-events: none; }
        .wp-dropdown-wrap { position: relative; }
        .wp-dropdown { position: absolute; top: 100%; left: 0; z-index: 50; margin-top: 2px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 4px 0; min-width: 180px; }
        .wp-dropdown-item { display: block; width: 100%; padding: 6px 12px; text-align: left; font-size: 12px; font-weight: 500; color: #374151; background: none; border: none; cursor: pointer; white-space: nowrap; }
        .wp-dropdown-item:hover { background: #f3f4f6; color: #111827; }
        .wp-dropdown-item.active { background: #ede9fe; color: #5F4A8B; font-weight: 700; }
        .wp-dropdown-sep { height: 1px; background: #e5e7eb; margin: 4px 0; }
        .format-btn { display: inline-flex; align-items: center; gap: 4px; height: 30px; padding: 0 10px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; color: #374151; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.1s; white-space: nowrap; }
        .format-btn:hover { border-color: #9ca3af; background: #f9fafb; }
        .editor-content-area { min-height: 350px; padding: 24px 32px; outline: none; font-size: 15px; line-height: 1.75; color: #1f2937; }
        .editor-content-area:focus { outline: none; }
        .editor-content-area h1 { font-size: 2em; font-weight: 800; margin: 0.67em 0; line-height: 1.2; color: #111827; }
        .editor-content-area h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; line-height: 1.3; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
        .editor-content-area h3 { font-size: 1.25em; font-weight: 700; margin: 0.75em 0; line-height: 1.3; color: #1f2937; }
        .editor-content-area h4 { font-size: 1.1em; font-weight: 600; margin: 0.75em 0; color: #374151; }
        .editor-content-area h5 { font-size: 1em; font-weight: 600; margin: 0.75em 0; color: #374151; }
        .editor-content-area h6 { font-size: 0.9em; font-weight: 600; margin: 0.75em 0; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .editor-content-area p { margin: 0 0 1em; }
        .editor-content-area ul, .editor-content-area ol { margin: 0 0 1em; padding-left: 1.5em; }
        .editor-content-area li { margin-bottom: 0.25em; }
        .editor-content-area blockquote { border-left: 4px solid #5F4A8B; margin: 1em 0; padding: 0.75em 1.25em; background: #f9fafb; color: #4b5563; font-style: italic; border-radius: 0 4px 4px 0; }
        .editor-content-area pre { background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 13px; margin: 1em 0; }
        .editor-content-area code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; color: #5F4A8B; }
        .editor-content-area pre code { background: none; padding: 0; color: inherit; }
        .editor-content-area hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
        .editor-content-area .editor-link { color: #5F4A8B; text-decoration: underline; }
        .editor-content-area .editor-image { max-width: 100%; border-radius: 6px; margin: 1em 0; }
        .editor-content-area table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .editor-content-area th, .editor-content-area td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
        .editor-content-area th { background: #f9fafb; font-weight: 600; }
        .editor-content-area mark { background: #fef08a; padding: 1px 3px; border-radius: 2px; }
        .wp-statusbar { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; font-weight: 500; }
        .wp-statusbar-left, .wp-statusbar-right { display: flex; align-items: center; gap: 12px; }
        .wp-source-textarea { width: 100%; min-height: 350px; padding: 24px 32px; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.6; color: #1f2937; background: #fff; border: none; outline: none; resize: vertical; }
        .wp-mode-toggle { display: inline-flex; border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden; }
        .wp-mode-btn { padding: 3px 10px; font-size: 11px; font-weight: 600; border: none; background: #fff; color: #6b7280; cursor: pointer; transition: all 0.1s; }
        .wp-mode-btn.active { background: #5F4A8B; color: #fff; }
        .wp-mode-btn:first-child { border-right: 1px solid #d1d5db; }
      ` }} />

      <div className="wp-toolbar">
        <div className="wp-dropdown-wrap" ref={formatRef}>
          <button type="button" className="format-btn" onClick={() => setShowFormatMenu(!showFormatMenu)}>
            {currentFormat()}
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showFormatMenu && (
            <div className="wp-dropdown">
              <button type="button" className={`wp-dropdown-item ${!editor.isActive("heading") && !editor.isActive("blockquote") && !editor.isActive("codeBlock") ? "active" : ""}`} onClick={() => setFormat(null)}>Paragraph</button>
              <div className="wp-dropdown-sep" />
              <button type="button" className={`wp-dropdown-item ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`} onClick={() => setFormat(1)}>Heading 1</button>
              <button type="button" className={`wp-dropdown-item ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`} onClick={() => setFormat(2)}>Heading 2</button>
              <button type="button" className={`wp-dropdown-item ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`} onClick={() => setFormat(3)}>Heading 3</button>
              <button type="button" className={`wp-dropdown-item ${editor.isActive("heading", { level: 4 }) ? "active" : ""}`} onClick={() => setFormat(4)}>Heading 4</button>
              <button type="button" className={`wp-dropdown-item ${editor.isActive("heading", { level: 5 }) ? "active" : ""}`} onClick={() => setFormat(5)}>Heading 5</button>
              <button type="button" className={`wp-dropdown-item ${editor.isActive("heading", { level: 6 }) ? "active" : ""}`} onClick={() => setFormat(6)}>Heading 6</button>
              <div className="wp-dropdown-sep" />
              <button type="button" className={`wp-dropdown-item ${editor.isActive("blockquote") ? "active" : ""}`} onClick={setBlockquote}>Blockquote</button>
              <button type="button" className={`wp-dropdown-item ${editor.isActive("codeBlock") ? "active" : ""}`} onClick={setCodeBlock}>Code Block</button>
            </div>
          )}
        </div>

        <div className="wp-toolbar-separator" />

        <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/></svg>
        </TB>

        <div className="wp-toolbar-separator" />

        <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bulleted List">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
        </TB>

        <div className="wp-toolbar-separator" />

        <TB onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
        </TB>

        <div className="wp-toolbar-separator" />

        <div className="wp-dropdown-wrap" ref={linkRef}>
          <TB onClick={() => { if (editor.isActive("link")) { handleRemoveLink(); } else { setShowLinkMenu(!showLinkMenu); } } } active={editor.isActive("link")} title="Insert/Edit Link">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
          </TB>
          {showLinkMenu && (
            <div className="wp-dropdown" style={{ minWidth: 260, padding: 12 }}>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleInsertLink()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleInsertLink} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors">Apply</button>
                  {editor.isActive("link") && (
                    <button type="button" onClick={handleRemoveLink} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors">Remove</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="wp-dropdown-wrap" ref={imageRef}>
          <TB onClick={() => setShowImageMenu(!showImageMenu)} title="Insert Image">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </TB>
          {showImageMenu && (
            <div className="wp-dropdown" style={{ minWidth: 280, padding: 12 }}>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => { setShowMediaPicker(true); setShowImageMenu(false); }}
                  className="w-full text-left px-3 py-2 bg-brand-primary/5 border border-brand-primary/20 rounded text-xs font-bold text-brand-primary hover:bg-brand-primary/10 transition-colors flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  Browse Media Library
                </button>
                <div className="wp-dropdown-sep" />
                <label className="text-[10px] font-bold text-gray-400 uppercase">Or paste URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleInsertImage()}
                  autoFocus
                />
                <button type="button" onClick={handleInsertImage} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors">Insert</button>
              </div>
            </div>
          )}
        </div>

        <div className="wp-dropdown-wrap" style={{ position: "relative" }} ref={tableRef}>
          <TB onClick={() => setTableMenu(!tableMenu)} title="Insert Table">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>
          </TB>
          {tableMenu && (
            <div className="wp-dropdown" style={{ minWidth: 160, padding: 8 }}>
              <button type="button" className="wp-dropdown-item" onClick={() => handleInsertTable(2, 2)}>2 × 2 Table</button>
              <button type="button" className="wp-dropdown-item" onClick={() => handleInsertTable(3, 3)}>3 × 3 Table</button>
              <button type="button" className="wp-dropdown-item" onClick={() => handleInsertTable(4, 4)}>4 × 4 Table</button>
              <button type="button" className="wp-dropdown-item" onClick={() => handleInsertTable(3, 5)}>3 × 5 Table</button>
            </div>
          )}
        </div>

        <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M2 11h20v2H2z"/></svg>
        </TB>

        <div className="wp-toolbar-separator" />

        <TB onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
        </TB>

        <div className="wp-toolbar-separator" />

        <TB onClick={() => {
          const items = [{ question: "", answer: "" }];
          editor.chain().focus().insertFaq(items).run();
        }} title="Insert FAQ Accordion">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
        </TB>

        <div className="wp-toolbar-separator" />

        <TB onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
        </TB>
        <TB onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
        </TB>

        <div style={{ flex: 1 }} />

        <div className="wp-mode-toggle">
          <button type="button" className={`wp-mode-btn ${!showSource ? "active" : ""}`} onClick={() => showSource && toggleSource()}>Visual</button>
          <button type="button" className={`wp-mode-btn ${showSource ? "active" : ""}`} onClick={() => !showSource && toggleSource()}>Text</button>
        </div>
      </div>

      {showSource ? (
        <textarea
          className="wp-source-textarea"
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      <div className="wp-statusbar">
        <div className="wp-statusbar-left">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <span>{charCount} characters</span>
        </div>
        <div className="wp-statusbar-right">
          <span>Paragraph</span>
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => {
            editor?.chain().focus().setImage({ src: url }).run();
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
